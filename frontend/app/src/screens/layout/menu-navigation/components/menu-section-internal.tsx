import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { menuNavigationItemStyle } from "@/screens/layout/menu-navigation/styles";
import { MenuItem } from "@/screens/layout/menu-navigation/types";
import { constructPath } from "@/utils/fetch";
import { Icon } from "@iconify-icon/react";
import { Link } from "react-router-dom";

export interface MenuSectionInternalProps {
  items: MenuItem[];
}

export function MenuSectionInternal({ items }: MenuSectionInternalProps) {
  return (
    <div className="flex flex-col">
      {items.map((item) => {
        if (!item.children || item.children.length === 0) {
          return (
            <DropdownMenuItem key={item.identifier} asChild>
              <Link to={constructPath(item.path)}>
                <Icon icon={item.icon} className="m-1 min-w-4" />
                <span className="text-sm">{item.title}</span>
              </Link>
            </DropdownMenuItem>
          );
        }

        return (
          <DropdownMenu key={item.identifier}>
            <DropdownMenuTrigger className={menuNavigationItemStyle}>
              <Icon icon={item.icon} className="text-lg min-w-4" />
              <span className="text-sm">{item.title}</span>
              <Icon
                icon="mdi:dots-vertical"
                className="m-1 ml-auto opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-data-[state=open]:opacity-100"
              />
            </DropdownMenuTrigger>

            <DropdownMenuContent side="left" align="start" className="min-w-[200px]">
              {item.children.map((child) => {
                if (!child.children || child.children.length === 0) {
                  return (
                    <DropdownMenuItem key={child.identifier} asChild>
                      <Link to={constructPath(child.path)}>{child.title}</Link>
                    </DropdownMenuItem>
                  );
                }

                return (
                  <DropdownMenuSub key={child.identifier}>
                    <DropdownMenuSubTrigger>{item.title}</DropdownMenuSubTrigger>

                    <DropdownMenuSubContent>
                      {child.children.map((grandchild) => {
                        return (
                          <DropdownMenuItem key={grandchild.identifier} asChild>
                            <Link to={constructPath(grandchild.path)}>{grandchild.title}</Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </div>
  );
}