import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Avatar, Text } from 'react-native-paper';
import { User } from '../types/auth.types';

interface UserProfileCardProps {
  user: User;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ user }) => {
  const getInitials = (username: string): string => {
    const parts = username.split(/[\s_.-]/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (username: string): string => {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DFE6E9',
      '#A29BFE',
      '#FD79A8',
    ];
    
    const index = username.length % colors.length;
    return colors[index];
  };

  const initials = getInitials(user.username);
  const avatarColor = getAvatarColor(user.username);

  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.avatarContainer}>
          <Avatar.Text
            size={64}
            label={initials}
            style={[styles.avatar, { backgroundColor: avatarColor }]}
            labelStyle={styles.avatarLabel}
          />
        </View>
        <View style={styles.infoContainer}>
          <Text variant="headlineSmall" style={styles.username}>
            {user.username}
          </Text>
          <Text variant="bodyMedium" style={styles.label}>
            Membro desde {new Date().getFullYear()}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    backgroundColor: '#3B82F6',
  },
  avatarLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoContainer: {
    flex: 1,
  },
  username: {
    fontWeight: '700',
    marginBottom: 4,
  },
  label: {
    opacity: 0.7,
  },
});
