
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: {
            backgroundColor: "#FFFFFF",
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="bookings" />
        <Stack.Screen name="categories" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="events" />
        <Stack.Screen name="my-tickets" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="reviews" />
      </Stack>
    </>
  );
}
