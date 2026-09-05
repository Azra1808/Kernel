import { fireEvent, render } from '@testing-library/react-native';
import AccueilScreen from '../AccueilScreen';

jest.mock('@expo/vector-icons/Feather', () => () => null);

describe('<AccueilScreen />', () => {
  it('affiche les trois modules et ouvre le dashboard Écosystème', async () => {
    const navigate = jest.fn();
    const screen = await render(
      <AccueilScreen navigation={{ navigate } as never} route={{ key: 'Accueil', name: 'Accueil' }} />
    );

    screen.getByText('Agriculture');
    screen.getByText('Ressources');
    fireEvent.press(screen.getByText('Écosystème'));

    expect(navigate).toHaveBeenCalledWith('Ecosysteme');
  });

  it('rend le statut hors ligne et l’activité récente', async () => {
    const screen = await render(
      <AccueilScreen navigation={{ navigate: jest.fn() } as never} route={{ key: 'Accueil', name: 'Accueil' }} />
    );

    screen.getByText(/Hors ligne/);
    screen.getByText('Fatou a signalé un point plein');
    screen.getByText('Diagnostic manioc enregistré');
  });
});
