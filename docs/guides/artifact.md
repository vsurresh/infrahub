---
icon: file-code
label: Creating an Artifact
---
# Creating an artifact in Infrahub

The goal of this guide is to define an artifact for a Jinja rendered File (RFile) or Python transform in Infrahub. We will be using the following steps.

1. Creating a group
2. Adding members to the group
3. Creating an artifact definition
4. Accessing the artifacts

!!!
This guide has the assumption that you followed the [Creating a Jinja Rendered File (RFile)](./jinja2-rfile.md) or [Creating a Python transform](./python-transform.md) guide. This is a prerequisite.
!!!

## Creating a group

Artifacts are defined by grouping a transformation with a group of targets in an Artifact Definition. As the first step we need to create a group, in which we can add the targets for which the artifact needs to be generated. Execute this GraphQL mutation to create the group `TagConfigGroup`.

```GraphQL
mutation CreateGroup {
  CoreStandardGroupCreate (data: {name: {value: "TagConfigGroup"}}) {
    ok
    object {
      id
    }
  }
}
```

Take note of the returned id, we will need it when we add members to this group.

## Adding targets to the group

We will be adding the `red` and `blue` tag to the `TagConfigGroup` group that we created in the previous step.

We need to retrieve the ids of the `red` and `blue` tag. Execute the following GraphQL query and take note of the ids.

```GraphQL
query {
  BuiltinTag (name__values: ["red","blue"]) {
    edges {
      node {
        id
        display_label
      }
    }
  }
}
```

Next, we will be adding the tag nodes to the group. We will use the following GraphQL mutation.
In the mutation, replace the ids:

- The first id needs to be replaced with the id of the group that we created in the first step
- The second and third id need to be replaced with the ids of the tags from the previous step

```graphql
mutation UpdateGroupMembers {
  CoreStandardGroupUpdate (
    data: {
      id: "<the name or the id of the group>", 
      members: [
        {id: "<id of red tag>"}, 
        {id: "<id of blue tag>"}]}
  ) {
    ok
  }
}
```

The resulting mutation should look like this (note that the ids will be different in your case).

```GraphQL
mutation UpdateGroupMembers {
  CoreStandardGroupUpdate(
    data: {
      id: "TagConfigGroup", 
      members: [
        {id: "17a8f438-fe39-d85f-3c3b-c51d66d0603f"}, 
        {id: "17a8f437-157a-e023-3c3c-c51f788ddf91"}]}
  ) {
    ok
  }
}
```

In the web interface navigate to Standard Groups under the Groups section in the menu on the left.
Select the `TagConfigGroup` and navigate to the Members tab. We can confirm that the `red` and `blue` tag are now a member of the group.

![Group members](../media/guides/artifact/artifact_group_members.png)

## Creating an artifact definition

In the last step we need to define an Artifact definition, which groups together a [transformation](../topics/transformation.md) with a target group and forms the definition of the artifact. Artifact definitions can be created via the frontend, via GraphQL or via a [Git repository](../topics/repository.md). In this guide we will be using the Git repository.

Add the following contents to the end of the `.infrahub.yml` file at the root of the `tags_render` repository.

```yaml
artifact_definitions:
  - name: "tags_config_file"
    artifact_name: "Tags configuration file"
    parameters:
      tag: "name__value"
    content_type: "text/plain"
    targets: "TagConfigGroup"
    transformation: "my-rfile"
```

This defines an artifact with the following properties:

- **name**: a unique name for the artifact
- **parameters**: the parameter to pass to the transformation GraphQL query, in this case this we will pass the name of the object (tag) as the tag parameter
- **content type**: the content type for the resulting artifact
- **targets**: the name of a group of which the members will be a target for this artifact
- **transformation**: the RFile or Python transformation that should be used

More details on the `.infrahub.yml` file format can be found in [.infrahub.yml topic](../topics/infrahub-yml.md).

Commit the changes to the repository and push them to the Git server

```bash
git add .
git commit -m "add tags_config_file artifact definition"
git push origin main
```

The artifact definition will be created in the database, when the git agent(s) notice the change in the git repository. The `tags_config_file` should now be visible in the Artifact Definition view in the web interface.
![Artifact Definition](../media/guides/artifact/artifact_definition.png)

## Accessing the artifacts

The artifacts are generated by the git-agents. You can find the resulting artifacts in the Artifact view under the Deployment menu in the web interface.

![Artifact](../media/guides/artifact/artifact_view.png)

Open an artifact to get the result.

![Artifact detail](../media/guides/artifact/artifact_detail.png)
You can download the artifact by clicking on the `Storage Id` or alternatively through the rest API endpoint `http://<INFRAHUB_HOST:INFRAHUB_PORT>/api/storage/object/<storage_id>`

Optionally, Infrahub can create a relation between a node and an artifact, by inheriting from the CoreArtifactTarget generic in the schema of the node. This is outside the scope of this guide, since the BuiltinTag node does not inherit from CoreArtifactTarget. More information can be found in the [artifact](../topics/artifact.md) topic.