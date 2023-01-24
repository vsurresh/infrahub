import copy
import logging
import uuid
from collections import defaultdict
from ipaddress import IPv4Network

from neo4j import AsyncSession

from infrahub.core.manager import NodeManager
from infrahub.core.node import Node

# flake8: noqa

DEVICE_ROLES = ["edge"]
INTF_ROLES = ["backbone", "transit", "peering", "peer", "loopback", "management", "spare"]
SITES = ["atl1", "ord1", "jfk1"]

DEVICES = (
    ("edge1", "active", "7280R3", "profile1", "edge", ["red", "green"]),
    ("edge2", "active", "7280R3", "profile1", "edge", ["red", "blue", "green"]),
)

NETWORKS_POOL_INTERNAL = IPv4Network("10.0.0.0/8").subnets(new_prefix=16)
LOOPBACK_POOL = next(NETWORKS_POOL_INTERNAL).hosts()
P2P_NETWORK_POOL = next(NETWORKS_POOL_INTERNAL).subnets(new_prefix=31)
NETWORKS_POOL_EXTERNAL = IPv4Network("203.0.113.0/24").subnets(new_prefix=29)

MANAGEMENT_IPS = IPv4Network("172.20.20.16/28").hosts()

P2P_NETWORKS_POOL = {
    ("atl1", "edge1", "ord1", "edge1"): next(P2P_NETWORK_POOL).hosts(),
    ("atl1", "edge1", "jfk1", "edge1"): next(P2P_NETWORK_POOL).hosts(),
    ("jfk1", "edge1", "ord1", "edge1"): next(P2P_NETWORK_POOL).hosts(),
    ("atl1", "edge2", "ord1", "edge2"): next(P2P_NETWORK_POOL).hosts(),
    ("atl1", "edge2", "jfk1", "edge2"): next(P2P_NETWORK_POOL).hosts(),
    ("jfk1", "edge2", "ord1", "edge2"): next(P2P_NETWORK_POOL).hosts(),
}

BACKBONE_CIRCUIT_IDS = [
    "DUFF-1543451",
    "DUFF-6535773",
    "DUFF-5826854",
    "DUFF-8263953",
    "DUFF-7324064",
    "DUFF-4867430",
    "DUFF-4654456",
]
EXTERNAL_CIRCUIT_IDS = [
    "DUFF-2245961",
    "DUFF-7192793",
    "DUFF-3144589",
    "DUFF-5095131",
    "DUFF-2825046",
    "DUFF-2131922",
    "DUFF-5943071",
    "DUFF-2939471",
    "DUFF-2322077",
    "DUFF-5282855",
    "DUFF-1071473",
    "DUFF-4412567",
    "DUFF-2359629",
    "DUFF-5535692",
    "DUFF-8417288",
    "DUFF-1532538",
    "DUFF-4906231",
    "DUFF-3422501",
    "DUFF-5874882",
    "DUFF-2067921",
    "DUFF-4849865",
    "DUFF-9705052",
    "DUFF-5388108",
    "DUFF-1906923",
    "DUFF-1989915",
    "DUFF-8338698",
]

EXTERNAL_CIRCUIT_IDS_GEN = (cid for cid in EXTERNAL_CIRCUIT_IDS)


INTERFACE_MGMT_NAME = {"7280R3": "Management0"}

INTERFACE_NAMES = {
    "7280R3": ["Ethernet1", "Ethernet2", "Ethernet3", "Ethernet4", "Ethernet5", "Ethernet6", "Ethernet7", "Ethernet8"],
}

INTERFACE_ROLES_MAPPING = {
    "edge": ["peer", "peer", "backbone", "backbone", "transit", "transit", "peering", "spare"],
}

STATUSES = ["active", "provisionning", "maintenance", "drained"]

TAGS = ["blue", "green", "red"]

ORGANIZATIONS = (
    ["Telia", 1299],
    ["Colt", 8220],
    ["Verizon", 701],
    ["GTT", 3257],
    ["Hurricane Electric", 6939],
    ["Lumen", 3356],
    ["Zayo", 6461],
    ["Duff", 64496],
    ["Equinix", 24115],
)

INTERFACE_OBJS = defaultdict(list)

ACCOUNTS = (
    ("pop-builder", "SCRIPT", ("operator",)),
    # ("nelly", "USER", ("network-engineer", "operator")),
    # ("mary", "USER", ("manager",)),
)

BGP_PEER_GROUPS = (
    ("POP_INTERNAL", "IMPORT_INTRA_POP", "EXPORT_INTRA_POP", "Duff", "Duff"),
    ("POP_GLOBAL", "IMPORT_POP_GLOBAL", "EXPORT_POP_GLOBLA", "Duff", None),
    ("TRANSIT_DEFAULT", "IMPORT_TRANSIT", "EXPORT_PUBLIC_PREFIX", "Duff", None),
    ("TRANSIT_TELIA", "IMPORT_TRANSIT", "EXPORT_PUBLIC_PREFIX", "Duff", "Telia"),
    ("IX_DEFAULT", "IMPORT_IX", "EXPORT_PUBLIC_PREFIX", "Duff", None),
)


LOGGER = logging.getLogger("infrahub")


async def load_data(session: AsyncSession):

    # ------------------------------------------
    # Create User Accounts and Groups
    # ------------------------------------------
    accounts_dict = {}
    tags_dict = {}
    orgs_dict = {}
    asn_dict = {}

    peer_group_dict = {}

    loopback_ip_dict = {}
    device_dict = {}

    for account in ACCOUNTS:
        obj = await Node.init(session=session, schema="Account")
        await obj.new(session=session, name=account[0], type=account[1])
        await obj.save(session=session)
        accounts_dict[account[0]] = obj

        # for group in account[2]:
        #     groups_dict[group].add_account(obj)

        LOGGER.info(f"Account Created: {obj.name.value}")

    for org in ORGANIZATIONS:
        obj = await Node.init(session=session, schema="Organization")
        await obj.new(session=session, name=org[0])
        await obj.save(session=session)

        asn = await Node.init(session=session, schema="AutonomousSystem")
        await asn.new(session=session, name=f"AS{org[1]}", asn=org[1], organization=obj)
        await asn.save(session=session)

        asn_dict[org[0]] = asn
        orgs_dict[org[0]] = obj
        LOGGER.info(f"Organization Created: {obj.name.value} | {asn.asn.value}")

    for peer_group in BGP_PEER_GROUPS:

        obj = await Node.init(session=session, schema="BGPPeerGroup")
        await obj.new(
            session=session,
            name=peer_group[0],
            import_policies=peer_group[1],
            export_policies=peer_group[2],
            local_as=asn_dict.get(peer_group[3], None),
            remote_as=asn_dict.get(peer_group[4], None),
        )
        await obj.save(session=session)

        peer_group_dict[peer_group[0]] = obj
        LOGGER.info(f"Peer Group Created: {obj.name.value}")

    # ------------------------------------------
    # Create Status, Role & DeviceProfile
    # ------------------------------------------
    statuses_dict = {}
    roles_dict = {}

    LOGGER.info("Creating Roles, Status & Tag")
    for role in DEVICE_ROLES + INTF_ROLES:
        obj = await Node.init(session=session, schema="Role")
        await obj.new(session=session, description=role.title(), name=role)
        await obj.save(session=session)
        roles_dict[role] = obj
        LOGGER.info(f" Created Role: {role}")

    for status in STATUSES:
        obj = await Node.init(session=session, schema="Status")
        await obj.new(session=session, description=status.title(), name=status)
        await obj.save(session=session)
        statuses_dict[status] = obj
        LOGGER.info(f" Created Status: {status}")

    for tag in TAGS:
        obj = await Node.init(session=session, schema="Tag")
        await obj.new(session=session, name=tag)
        await obj.save(session=session)
        tags_dict[tag] = obj
        LOGGER.info(f" Created Tag: {tag}")

    active_status = statuses_dict["active"]
    internal_as = asn_dict["Duff"]

    LOGGER.info("Creating Site & Device")

    for site_idx, site_name in enumerate(SITES):

        site = await Node.init(session=session, schema="Location")
        await site.new(session=session, name=site_name, type="SITE")
        await site.save(session=session)
        LOGGER.info(f"Created Site: {site_name}")

        # site_networks = next(NETWORKS_POOL_INTERNAL).subnets(new_prefix=24)
        peer_networks = {
            0: next(P2P_NETWORK_POOL).hosts(),
            1: next(P2P_NETWORK_POOL).hosts(),
        }

        # Build a new list with the names of the other sites for later
        other_sites = copy.copy(SITES)
        other_sites.remove(site_name)
        other_sites = sorted(other_sites)

        for idx, device in enumerate(DEVICES):

            device_name = f"{site_name}-{device[0]}"
            status_id = statuses_dict[device[1]].id
            role_id = roles_dict[device[4]].id
            device_type = device[2]

            obj = await Node.init(session=session, schema="Device")
            await obj.new(
                session=session,
                site=site,
                name=device_name,
                status=status_id,
                type=device[2],
                role=role_id,
                # source=pop_builder_account,
                asn=asn_dict["Duff"],
                tags=[tags_dict[tag_name] for tag_name in device[5]],
            )
            await obj.save(session=session)

            device_dict[device_name] = obj
            LOGGER.info(f"- Created Device: {device_name}")

            # Loopback Interface
            intf = await Node.init(session=session, schema="Interface")
            await intf.new(
                session=session,
                device=obj.id,
                name="Loopback0",
                enabled=True,
                status=active_status.id,
                role=roles_dict["loopback"].id,
                speed=1000,
                # source=pop_builder_account,
            )
            await intf.save(session=session)

            ip = await Node.init(session=session, schema="IPAddress")
            await ip.new(session=session, interface=intf.id, address=f"{str(next(LOOPBACK_POOL))}/32")
            await ip.save(session=session)

            loopback_ip_dict[device_name] = ip

            # Management Interface
            intf = await Node.init(session=session, schema="Interface")
            await intf.new(
                session=session,
                device=obj.id,
                name=INTERFACE_MGMT_NAME[device_type],
                enabled=True,
                status=active_status.id,
                role=roles_dict["management"].id,
                speed=1000,
                # source=pop_builder_account,
            )
            await intf.save(session=session)

            ip = await Node.init(session=session, schema="IPAddress")
            await ip.new(session=session, interface=intf.id, address=f"{str(next(MANAGEMENT_IPS))}/24")
            await ip.save(session=session)

            # Other Interfaces
            for intf_idx, intf_name in enumerate(INTERFACE_NAMES[device_type]):

                intf_role = INTERFACE_ROLES_MAPPING[device[4]][intf_idx]
                intf_role_id = roles_dict[intf_role].id

                intf = await Node.init(session=session, schema="Interface")
                await intf.new(
                    session=session,
                    device=obj.id,
                    name=intf_name,
                    speed=10000,
                    enabled=True,
                    status=active_status.id,
                    role=intf_role_id,
                    # source=pop_builder_account,
                )
                await intf.save(session=session)

                INTERFACE_OBJS[device_name].append(intf)

                address = None
                if intf_role == "peer":
                    address = f"{str(next(peer_networks[intf_idx]))}/31"

                if intf_role == "backbone":
                    site_idx = intf_idx - 2
                    other_site_name = other_sites[site_idx]  # f"{other_sites[site_idx]}-{device[0]}"
                    sites = sorted([site_name, other_site_name])
                    link_id = (sites[0], device[0], sites[1], device[0])
                    address = f"{str(next(P2P_NETWORKS_POOL[link_id]))}/31"

                if intf_role in ["transit", "peering"]:
                    subnet = next(NETWORKS_POOL_EXTERNAL).hosts()
                    address = f"{str(next(subnet))}/29"

                    peer_address = f"{str(next(subnet))}/29"

                if not address:
                    continue

                ip = await Node.init(session=session, schema="IPAddress")
                await ip.new(
                    session=session,
                    interface=intf.id,
                    address=address,
                    # source=pop_builder_account
                )
                await ip.save(session=session)

                # Create Circuit and BGP session for transit and peering
                if intf_role in ["transit", "peering"]:
                    circuit_id = next(EXTERNAL_CIRCUIT_IDS_GEN)
                    transit_providers = ["Telia", "Colt"]

                    if intf_role == "transit":
                        provider_name = transit_providers[intf_idx % 2]
                    elif intf_role == "peering":
                        provider_name = "Equinix"

                    provider = orgs_dict[provider_name]

                    circuit = await Node.init(session=session, schema="Circuit")
                    await circuit.new(
                        session=session,
                        circuit_id=circuit_id,
                        vendor_id=f"{provider_name.upper()}-{str(uuid.uuid4())[:8]}",
                        provider=provider.id,
                        # type=intf_role.upper(),
                        status=active_status.id,
                        role=roles_dict[intf_role].id,
                    )
                    await circuit.save(session=session)

                    endpoint1 = await Node.init(session=session, schema="CircuitEndpoint")
                    await endpoint1.new(session=session, site=site, circuit=circuit.id, connected_interface=intf.id)
                    await endpoint1.save(session=session)

                    intf.description.value = f"Connected to {provider_name} via {circuit_id}"

                    if intf_role == "transit":
                        peer_group_name = (
                            "TRANSIT_TELIA" if "telia" in provider.name.value.lower() else "TRANSIT_DEFAULT"
                        )

                        peer_ip = await Node.init(session=session, schema="IPAddress")
                        await peer_ip.new(
                            session=session,
                            address=peer_address,
                            # source=pop_builder_account
                        )
                        await peer_ip.save(session=session)

                        peer_as = asn_dict[provider_name]
                        bgp_session = await Node.init(session=session, schema="BGPSession")
                        await bgp_session.new(
                            session=session,
                            type="EXTERNAL",
                            local_as=internal_as,
                            local_ip=ip,
                            remote_as=peer_as,
                            remote_ip=peer_ip,
                            peer_group=peer_group_dict[peer_group_name],
                            device=device_dict[device_name],
                            status=active_status.id,
                            role=roles_dict[intf_role].id,
                        )
                        await bgp_session.save(session=session)

                        LOGGER.info(
                            f" Created BGP Session '{device_name}' >> '{provider_name}': '{peer_group_name}' '{ip.address.value}' >> '{peer_ip.address.value}'"
                        )

        # Connect pair within a site together
        for idx in range(0, 2):
            intf1 = INTERFACE_OBJS[f"{site_name}-edge1"][idx]
            intf2 = INTERFACE_OBJS[f"{site_name}-edge2"][idx]

            await intf1.connected_interface.update(session=session, data=intf2)
            intf1.description.value = f"Connected to {site_name}-edge2 {intf2.name.value}"
            await intf1.save(session=session)

            intf2.description.value = f"Connected to {site_name}-edge1 {intf1.name.value}"
            await intf2.save(session=session)

            LOGGER.debug(
                f"Connected  '{site_name}-edge1::{intf1.name.value}' <> '{site_name}-edge2::{intf2.name.value}'"
            )

    # --------------------------------------------------
    # CREATE iBGP SESSION
    # --------------------------------------------------

    for device1, loopback1 in loopback_ip_dict.items():
        for device2, loopback2 in loopback_ip_dict.items():
            if device1 == device2:
                continue
            site1 = device1.split("-")[0]
            site2 = device2.split("-")[0]

            peer_group_name = "POP_INTERNAL" if site1 == site2 else "POP_GLOBAL"

            obj = await Node.init(session=session, schema="BGPSession")
            await obj.new(
                session=session,
                type="INTERNAL",
                local_as=internal_as,
                local_ip=loopback1,
                remote_as=internal_as,
                remote_ip=loopback2,
                peer_group=peer_group_dict[peer_group_name].id,
                device=device_dict[device1].id,
                status=active_status.id,
                role=roles_dict["backbone"],
            )
            await obj.save(session=session)

            LOGGER.info(
                f" Created BGP Session '{device1}' >> '{device2}': '{peer_group_name}' '{loopback1.address.value}' >> '{loopback2.address.value}'"
            )

    # --------------------------------------------------
    # CREATE BACKBONE LINKS & CIRCUITS
    # --------------------------------------------------
    for idx, backbone_link in enumerate(P2P_NETWORKS_POOL.keys()):

        site1 = backbone_link[0]
        site2 = backbone_link[2]
        device = backbone_link[1]

        # Build a new list with the names of the other sites for later
        other_site_site1 = copy.copy(SITES)
        other_site_site1.remove(site1)
        other_site_site1 = sorted(other_site_site1)

        other_site_site2 = copy.copy(SITES)
        other_site_site2.remove(site2)
        other_site_site2 = sorted(other_site_site2)

        intf1 = INTERFACE_OBJS[f"{site1}-{device}"][other_site_site1.index(site2) + 2]
        intf2 = INTERFACE_OBJS[f"{site2}-{device}"][other_site_site2.index(site1) + 2]

        circuit_id = BACKBONE_CIRCUIT_IDS[idx]

        if idx <= 2:
            provider_name = "Lumen"
        else:
            provider_name = "Zayo"

        provider = orgs_dict[provider_name]
        obj = await Node.init(session=session, schema="Circuit")
        await obj.new(
            session=session,
            circuit_id=BACKBONE_CIRCUIT_IDS[idx],
            vendor_id=f"{provider_name.upper()}-{str(uuid.uuid4())[:8]}",
            provider=provider,
            # type="DARK FIBER",
            status=active_status,
            role=roles_dict["backbone"],
        )
        await obj.save(session=session)

        endpoint1 = await Node.init(session=session, schema="CircuitEndpoint")
        await endpoint1.new(session=session, site=site1, circuit=obj, connected_interface=intf1)
        await endpoint1.save(session=session)
        endpoint2 = await Node.init(session=session, schema="CircuitEndpoint")
        await endpoint2.new(session=session, site=site2, circuit=obj, connected_interface=intf2)
        await endpoint2.save(session=session)

        intf11 = await NodeManager.get_one(session=session, id=intf1.id)
        intf11.description.value = f"Connected to {site2}-{device} via {circuit_id}"
        await intf11.save(session=session)

        intf21 = await NodeManager.get_one(session=session, id=intf2.id)
        intf21.description.value = f"Connected to {site1}-{device} via {circuit_id}"
        await intf21.save(session=session)

        LOGGER.info(f"Connected  '{site1}-{device}::{intf1.name.value}' <> '{site2}-{device}::{intf2.name.value}'")
