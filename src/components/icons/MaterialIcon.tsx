import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

type MaterialIconProps = {
  name: IconName;
  size: number;
  color: string;
};

export function MaterialIcon({ name, size, color }: MaterialIconProps) {
  return <MaterialIcons name={name} size={size} color={color} />;
}
