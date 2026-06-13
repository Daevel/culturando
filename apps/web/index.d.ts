declare module "*.svg" {
  import type { ComponentType, SVGProps } from "react";

  const content: string;
  export const ReactComponent: ComponentType<SVGProps<SVGSVGElement>>;
  export default content;
}
