declare global {
	namespace App {
		interface Locals {
			user?: {
				_id: string;
				email: string;
				name: string;
			};
		}
	}
}

export {};
