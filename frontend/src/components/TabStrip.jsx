import React from "react";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Text } from "./ui/text";

// tabs: lista de { key, label }
export const TabStrip = ({ tabs, value, onChange }) => (
  <Tabs value={value} onValueChange={onChange}>
    <TabsList>
      {tabs.map((tab) => (
        <TabsTrigger key={tab.key} value={tab.key}>
          <Text>{tab.label}</Text>
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
);
