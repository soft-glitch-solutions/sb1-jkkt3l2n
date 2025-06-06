import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '@/hook/useProfile';
import { Camera } from 'lucide-react-native';

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const {
    profile,
    loading: profileLoading,
    updateProfile,
    uploadAvatar,
  } = useProfile();

  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null);
  const [uploading, setUploading] = useState(false);

  // Ref for file input (web only)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when profile data changes
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setEmail(profile.email || '');
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  // Handle saving profile changes
  const handleSave = async () => {
    try {
      const updates = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        avatar_url: avatarUrl,
      };

      await updateProfile(updates);
      alert('Profile updated successfully!');
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error.message);
      alert('Failed to update profile. Please try again.');
    }
  };

  // Handle image picker for avatar upload (mobile)
  const handleImagePickerMobile = async () => {
    try {
      setUploading(true);

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0].uri;
        const publicUrl = await uploadAvatar(selectedImage);
        setAvatarUrl(publicUrl);
      }
    } catch (error) {
      console.error('Error picking or uploading image:', error);
      alert('Failed to pick or upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change for avatar upload (web)
  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      const file = event.target.files?.[0];
      if (!file || !file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }

      const publicUrl = await uploadAvatar(file);
      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  // Handle image picker (mobile) or file input (web)
  const handleImagePicker = () => {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    } else {
      handleImagePickerMobile();
    }
  };

  if (profileLoading) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.formContainer}>
          {/* Avatar Skeleton */}
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarSkeleton, { backgroundColor: colors.card }]} />
          </View>

          {/* Points Skeleton */}
          <View style={styles.pointsContainer}>
            <View style={[styles.pointsSkeleton, { backgroundColor: colors.card }]} />
          </View>

          {/* First Name Skeleton */}
          <View style={styles.inputSkeleton}>
            <View style={[styles.skeleton, { backgroundColor: colors.card }]} />
          </View>

          {/* Last Name Skeleton */}
          <View style={styles.inputSkeleton}>
            <View style={[styles.skeleton, { backgroundColor: colors.card }]} />
          </View>

          {/* Email Skeleton */}
          <View style={styles.inputSkeleton}>
            <View style={[styles.skeleton, { backgroundColor: colors.card }]} />
          </View>

          {/* Save Button Skeleton */}
          <View style={styles.saveButtonSkeleton}>
            <View style={[styles.skeleton, { backgroundColor: colors.card }]} />
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.formContainer}>
        {/* Hidden file input for web */}
        {Platform.OS === 'web' && (
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileInputChange}
          />
        )}

        {/* Avatar Upload Section */}
        <TouchableOpacity onPress={handleImagePicker} style={styles.avatarContainer} disabled={uploading}>
          {uploading ? (
            <View style={[styles.avatarSkeleton, { backgroundColor: colors.card }]} />
          ) : avatarUrl ? (
            <View style={{ position: 'relative' }}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              <View style={[styles.cameraButton, { backgroundColor: colors.primary }]}>
                <Camera size={16} color="white" />
              </View>
            </View>
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.card }]}>
              <Text style={{ color: colors.text }}>Select Profile Picture</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Points Display */}
        <View style={styles.pointsContainer}>
          <Text style={[styles.pointsText, { color: colors.text }]}>Points: {profile?.points || 0}</Text>
        </View>

        {/* First Name Input */}
        <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter your first name"
          placeholderTextColor={colors.textSecondary}
        />

        {/* Last Name Input */}
        <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter your last name"
          placeholderTextColor={colors.textSecondary}
        />

        {/* Email Input */}
        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
        />

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={uploading}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  formContainer: {
    gap: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSkeleton: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pointsSkeleton: {
    width: 100,
    height: 20,
    borderRadius: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  inputSkeleton: {
    marginBottom: 16,
  },
  skeleton: {
    width: '100%',
    height: 40,
    borderRadius: 8,
  },
  saveButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonSkeleton: {
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});