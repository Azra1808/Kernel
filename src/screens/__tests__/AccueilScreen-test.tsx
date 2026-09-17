import { fireEvent, render } from '@testing-library/react-native';
import AccueilScreen from '../AccueilScreen';
import { PreferencesProvider } from '../../theme/PreferencesContext';

jest.mock('@expo/vector-icons/Feather', () => () => null);

function renderWithPreferences(ui: React.ReactElement) {
  return render(<PreferencesProvider>{ui}</PreferencesProvider>);
}

describe('<AccueilScreen />', () => {
  it(
    'affiche les trois modules et ouvre le dashboard Écosystème',
    async () => {
      const navigate = jest.fn();
      const screen = await renderWithPreferences(
        <AccueilScreen navigation={{ navigate } as never} route={{ key: 'Accueil', name: 'Accueil' }} />
      );

      screen.getByText('Agriculture');
      screen.getByText('Ressources');
      fireEvent.press(screen.getByText('Écosystème'));

      expect(navigate).toHaveBeenCalledWith('Tabs', { screen: 'Ecosysteme' });
    },
    15000
  );

  it('rend le statut hors ligne et l’activité récente', async () => {
    const screen = await renderWithPreferences(
      <AccueilScreen navigation={{ navigate: jest.fn() } as never} route={{ key: 'Accueil', name: 'Accueil' }} />
    );

    screen.getByText(/Hors ligne/);
    screen.getByText('Fatou a signalé un point plein');
    screen.getByText('Diagnostic manioc enregistré');
  });
});
