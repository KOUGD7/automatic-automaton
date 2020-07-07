import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* pages */
import Home from './pages/Home';
import Alphabet from './pages/SelectAlphabet';
import TweakParams from './pages/TweakParams';
import Simulator from './pages/Simulator';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

const App: React.FC = () => (
	<IonApp>
		<IonReactRouter>
			<IonRouterOutlet>
				<Route path="/home" component={Home} />
				<Route path="/alphabet" component={Alphabet} />
				<Route path="/params" component={TweakParams} />
				<Route path="/simulator" component={Simulator} />
				<Redirect exact from="/" to="/simulator" />
			</IonRouterOutlet>
		</IonReactRouter>
	</IonApp>
);

export default App;
