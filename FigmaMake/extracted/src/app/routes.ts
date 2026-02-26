import { createBrowserRouter } from 'react-router';
import { Home } from './pages/Home';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { DashboardLayout } from './components/DashboardLayout';
import { MerchantDashboard } from './pages/MerchantDashboard';
import { MyCharacters } from './pages/MyCharacters';
import { CharacterStudio } from './pages/CharacterStudio';
import { EditCharacter } from './pages/EditCharacter';
import { WidgetSettings } from './pages/WidgetSettings';
import { Analytics } from './pages/PlaceholderPages';
import { Billing } from './pages/Billing';
import { SettingsPage } from './pages/PlaceholderPages';
import { WidgetDemo } from './pages/WidgetDemo';
import { PublicCharacter } from './pages/PublicCharacter';
import { Welcome } from './pages/Welcome';
import { Pricing } from './pages/Pricing';
import { Features } from './pages/Features';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Home,
  },
  {
    path: '/sign-in',
    Component: SignIn,
  },
  {
    path: '/sign-up',
    Component: SignUp,
  },
  {
    path: '/welcome',
    Component: Welcome,
  },
  {
    path: '/pricing',
    Component: Pricing,
  },
  {
    path: '/features',
    Component: Features,
  },
  {
    path: '/demo',
    Component: WidgetDemo,
  },
  {
    path: '/c/:slug',
    Component: PublicCharacter,
  },
  {
    path: '/dashboard',
    Component: DashboardLayout,
    children: [
      {
        index: true,
        Component: MerchantDashboard,
      },
      {
        path: 'characters',
        Component: MyCharacters,
      },
      {
        path: 'characters/new',
        Component: CharacterStudio,
      },
      {
        path: 'characters/edit/:id',
        Component: EditCharacter,
      },
      {
        path: 'widgets',
        Component: WidgetSettings,
      },
      {
        path: 'analytics',
        Component: Analytics,
      },
      {
        path: 'billing',
        Component: Billing,
      },
      {
        path: 'settings',
        Component: SettingsPage,
      },
    ],
  },
]);