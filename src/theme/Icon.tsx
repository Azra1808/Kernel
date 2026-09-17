import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from './colors';

/**
 * Équivalent React Native du sprite SVG unique (symbol/use) de la
 * maquette web. RN ne supporte pas <use>, donc chaque icône est un
 * composant séparé, mais TOUTES partagent le même contrat (name, size,
 * color) pour rester interchangeables comme un vrai sprite.
 *
 * Tracés copiés à l'identique depuis assets/design/kernel-mockup.html
 * (viewBox 0 0 24 24, stroke uniquement, pas de fill) pour garantir une
 * fidélité pixel-perfect avec la maquette validée.
 *
 * Pour ajouter une icône : copier le <path>/<circle>/<rect> du symbole
 * correspondant dans le mockup et l'ajouter à ICONS ci-dessous.
 */
export type IconName =
  | 'home'
  | 'leaf'
  | 'crate'
  | 'globe'
  | 'chat'
  | 'gear'
  | 'sun'
  | 'moon'
  | 'lang'
  | 'textsize'
  | 'camera'
  | 'mic'
  | 'send'
  | 'chevron'
  | 'plus'
  | 'bell'
  | 'wifioff';

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 24, color = colors.ink, strokeWidth = 1.8 }: IconProps) {
  const commonProps = {
    fill: 'none' as const,
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {renderIconContent(name, commonProps)}
    </Svg>
  );
}

function renderIconContent(name: IconName, p: Record<string, unknown>) {
  switch (name) {
    case 'home':
      return (
        <>
          <Path d="M4 11 12 4l8 7" {...p} />
          <Path d="M6 10v9h12v-9" {...p} />
        </>
      );
    case 'leaf':
      return (
        <>
          <Path d="M4 20C4 12 10 4 20 4c0 10-8 16-16 16Z" {...p} />
          <Path d="M4 20c3-5 7-8 12-10" {...p} />
        </>
      );
    case 'crate':
      return (
        <>
          <Rect x={4} y={9} width={16} height={11} rx={1.5} {...p} />
          <Path d="M4 9l2-5h12l2 5" {...p} />
          <Path d="M9 13h6" {...p} />
        </>
      );
    case 'globe':
      return (
        <>
          <Circle cx={12} cy={12} r={8.5} {...p} />
          <Path d="M3.5 12h17" {...p} />
          <Path d="M12 3.5c3 3 3 14 0 17c-3-3-3-14 0-17Z" {...p} />
        </>
      );
    case 'chat':
      return <Path d="M4 5h16v11H9l-5 4V5Z" {...p} />;
    case 'gear':
      return (
        <>
          <Circle cx={12} cy={12} r={3.2} {...p} />
          <Path
            d="M12 3v2.4M12 18.6V21M4.9 6.3l1.7 1.7M17.4 16l1.7 1.7M3 12h2.4M18.6 12H21M4.9 17.7l1.7-1.7M17.4 8l1.7-1.7"
            {...p}
          />
        </>
      );
    case 'sun':
      return (
        <>
          <Circle cx={12} cy={12} r={4} {...p} />
          <Path
            d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"
            {...p}
          />
        </>
      );
    case 'moon':
      return <Path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" {...p} />;
    case 'lang':
      return (
        <>
          <Circle cx={12} cy={12} r={8.5} {...p} />
          <Path d="M3.5 12h17M12 3.5c3 3 3 14 0 17c-3-3-3-14 0-17Z" {...p} />
        </>
      );
    case 'textsize':
      return (
        <>
          <Path d="M4 18 8.5 6h1L14 18M5.3 14.5h7.4" {...p} />
          <Path d="M16 18V9.5h3.5M14.5 18h4.5" {...p} />
        </>
      );
    case 'camera':
      return (
        <>
          <Path d="M4 8h3l1.5-2h7L17 8h3v11H4Z" {...p} />
          <Circle cx={12} cy={13.5} r={3.3} {...p} />
        </>
      );
    case 'mic':
      return (
        <>
          <Rect x={9} y={3} width={6} height={11} rx={3} {...p} />
          <Path d="M6 11a6 6 0 0 0 12 0M12 17v4" {...p} />
        </>
      );
    case 'send':
      return <Path d="M4 12 20 4l-6 16-3-7-7-1Z" {...p} />;
    case 'chevron':
      return <Path d="M15 5 8 12l7 7" {...p} />;
    case 'plus':
      return <Path d="M12 5v14M5 12h14" {...p} />;
    case 'bell':
      return (
        <>
          <Path d="M6 10a6 6 0 0 1 12 0v5l2 3H4l2-3Z" {...p} />
          <Path d="M10 21a2 2 0 0 0 4 0" {...p} />
        </>
      );
    case 'wifioff':
      return (
        <>
          <Path
            d="M3 8.5a16 16 0 0 1 4.6-2.8M20.6 8.5a16 16 0 0 0-4.6-2.8M6.5 12a10 10 0 0 1 4-2M17.5 12a10 10 0 0 0-4-2M9.5 15.3a5 5 0 0 1 5 0M12 19v.01"
            {...p}
          />
          <Path d="M2 2l20 20" {...p} />
        </>
      );
  }
}
