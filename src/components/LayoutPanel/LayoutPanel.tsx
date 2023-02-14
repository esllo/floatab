import { Tabs } from "@mantine/core";

interface Props {
  label: string;
}

const LayoutPanel = ({ children, label }: StaticPropsWithChildren<Props>) => {
  return (
    <Tabs.Panel sx={{ height: "100%" }} value={label}>
      {children}
    </Tabs.Panel>
  );
};

export default LayoutPanel;
