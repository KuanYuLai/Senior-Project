import React from 'react';
import App from './App';
import { CookiesProvider } from 'react-cookie';

/* This component just wraps the App.js page in a CookiesProvider,
 * allowing cookies to be used anywhere on the site. */
export default function Root() {
	return (
		<CookiesProvider>
			<App />
		</CookiesProvider>
	);
}