export const morningTheme = {
    background: '#F6F1E8',
    textPrimary: '#2F352F',
    textSecondary: '#6F756B',
    textMuted: '#8A8F86',
    accentPrimary: '#C9923D',
    accentPrimaryDark: '#AF7C30',
    accentSecondary: '#A8B39E',
    accentSecondaryText: '#4E5A4B',
    highlight: '#E8D2A8',
    surface: '#FBF8F2',
    surfaceSecondary: '#EFE7DA',
    border: '#D8CCBB',
    buttonPrimary: '#C9923D',
    buttonPrimaryText: '#FFF9F0',
    buttonSecondaryBackground: '#F1EBE0',
    buttonSecondaryText: '#4E5A4B',
    segmentedBackground: '#E9E1D4',
    segmentedText: '#4E4A43',
    supportRowBackground: '#F1EBE0',
    supportRowBorder: '#D8CCBB',
    supportRowText: '#4E5A4B',
    textSizeBadgeBackground: '#E8D2A8',
    textSizeBadgeText: '#5A4525',
    statusTopStripColor: '#C9923D',
    selectedBackground: '#E8D2A8',
    selectedText: '#2F352F',
    headerGradientStart: '#EDE4D4',
    overlayBackground: 'rgba(47, 53, 47, 0.24)',
}

export const eveningTheme = {
    background: '#0F1722',
    textPrimary: '#E6EAF0',
    textSecondary: '#9AA6B2',
    accentPrimary: '#D6A85F',
    accentSecondary: '#6C8EBF',
    highlight: '#2A3A4F',
    surface: '#182230',
    surfaceSecondary: '#141C28',
    border: '#253244',
    buttonPrimary: '#D6A85F',
    buttonPrimaryText: '#0F1722',
    buttonSecondaryBackground: '#243247',
    buttonSecondaryText: '#C7D2DA',
    segmentedBackground: '#243247',
    segmentedText: '#C7D2DA',
    supportRowBackground: '#243247',
    supportRowBorder: '#253244',
    supportRowText: '#C7D2DA',
    textSizeBadgeBackground: '#2A3A4F',
    textSizeBadgeText: '#D6E0EA',
    statusTopStripColor: '#0F1722',
    selectedBackground: '#2A3A4F',
    selectedText: '#E6EAF0',
    headerGradientStart: '#1A2433',
    overlayBackground: 'rgba(10, 16, 26, 0.52)',
}

function toKebabCase(value) {
    return value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)
}

export function themeToCssVariables(themeObj) {
    return Object.entries(themeObj).reduce((acc, [key, value]) => {
        acc[`--${toKebabCase(key)}`] = value
        return acc
    }, {})
}
