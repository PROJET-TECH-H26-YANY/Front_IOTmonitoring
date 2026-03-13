import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import StudentLive from "../pages/StudentLive";
import ManageStudents from "../pages/ManageStudents";
import SystemStatus from "../pages/SystemStatus";
import Dashboard from "../pages/Dashboard";
import History from "../pages/History";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#4f46e5" },
        headerTintColor: "#fff",
        tabBarActiveTintColor: "#4f46e5",
        tabBarInactiveTintColor: "gray",
      }}
    >
      <Tab.Screen
        name="Live"
        component={StudentLive}
        options={{ title: "En Direct" }}
      />
      <Tab.Screen
        name="Students"
        component={ManageStudents}
        options={{ title: "Élèves" }}
      />
      <Tab.Screen
        name="System"
        component={SystemStatus}
        options={{ title: "Système" }}
      />
        <Tab.Screen
          name="History"
          component={History}
          options={{ title: "Historique" }}
        />
      <Tab.Screen
        name="Profil"
        component={Dashboard}
        options={{ title: "Profil" }}
      />
    </Tab.Navigator>
  );
}
