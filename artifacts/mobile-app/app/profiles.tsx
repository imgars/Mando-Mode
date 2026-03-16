import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfileCard } from "@/components/ProfileCard";
import Colors from "@/constants/colors";
import { useOverlay } from "@/context/OverlayContext";

export default function ProfilesScreen() {
  const insets = useSafeAreaInsets();
  const {
    profiles,
    activeProfileId,
    addProfile,
    deleteProfile,
    renameProfile,
    setActiveProfile,
  } = useOverlay();
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const handleAdd = () => {
    if (newName.trim()) {
      addProfile(newName.trim());
      setNewName("");
      setShowInput(false);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (Platform.OS === "web") {
      if (confirm(`Eliminar perfil "${name}"?`)) {
        deleteProfile(id);
      }
    } else {
      Alert.alert("Eliminar perfil", `Eliminar "${name}"?`, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteProfile(id),
        },
      ]);
    }
  };

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      renameProfile(editingId, editName.trim());
      setEditingId(null);
      setEditName("");
    }
  };

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top + webTopInset + 12,
        },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.headerBtn,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Feather name="x" size={22} color={Colors.light.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Perfiles de Juego</Text>
        <Pressable
          onPress={() => setShowInput(true)}
          style={({ pressed }) => [
            styles.addBtn,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Feather name="plus" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      {showInput ? (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Nombre del juego..."
            placeholderTextColor={Colors.light.textSecondary}
            value={newName}
            onChangeText={setNewName}
            onSubmitEditing={handleAdd}
            autoFocus
            returnKeyType="done"
          />
          <Pressable
            onPress={handleAdd}
            style={({ pressed }) => [
              styles.confirmBtn,
              pressed && { opacity: 0.85 },
              !newName.trim() && { opacity: 0.4 },
            ]}
            disabled={!newName.trim()}
          >
            <Feather name="check" size={18} color="#FFFFFF" />
          </Pressable>
          <Pressable
            onPress={() => {
              setShowInput(false);
              setNewName("");
            }}
            style={({ pressed }) => [
              styles.cancelBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather name="x" size={18} color={Colors.light.textSecondary} />
          </Pressable>
        </View>
      ) : null}

      {editingId ? (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Nuevo nombre..."
            placeholderTextColor={Colors.light.textSecondary}
            value={editName}
            onChangeText={setEditName}
            onSubmitEditing={handleSaveEdit}
            autoFocus
            returnKeyType="done"
          />
          <Pressable
            onPress={handleSaveEdit}
            style={({ pressed }) => [
              styles.confirmBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Feather name="check" size={18} color="#FFFFFF" />
          </Pressable>
          <Pressable
            onPress={() => {
              setEditingId(null);
              setEditName("");
            }}
            style={({ pressed }) => [
              styles.cancelBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather name="x" size={18} color={Colors.light.textSecondary} />
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProfileCard
            profile={item}
            isActive={item.id === activeProfileId}
            onPress={() => setActiveProfile(item.id)}
            onEdit={() => handleStartEdit(item.id, item.name)}
            onDelete={() => handleDelete(item.id, item.name)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + webBottomInset + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={profiles.length > 0}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather
              name="folder-plus"
              size={40}
              color={Colors.light.textSecondary}
            />
            <Text style={styles.emptyTitle}>Sin perfiles</Text>
            <Text style={styles.emptyText}>
              Crea un perfil para cada juego con{"\n"}su propia configuracion de
              zonas
            </Text>
            <Pressable
              onPress={() => setShowInput(true)}
              style={({ pressed }) => [
                styles.emptyBtn,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Feather name="plus" size={16} color="#FFFFFF" />
              <Text style={styles.emptyBtnText}>Crear perfil</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    textAlign: "center",
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 46,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  confirmBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.light.success,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.light.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingTop: 4,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  emptyBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
});
