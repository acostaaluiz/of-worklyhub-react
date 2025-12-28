import React, { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const UsersHomePage = lazy(() => import("@modules/users/presentation/pages/home/home.page"));
const ProfilePage = lazy(() => import("@modules/users/presentation/pages/profile/profile.page"));

export const usersStackRoutes: RouteObject[] = [
	{
		id: "users",
		path: "/",
		children: [
			{
				id: "users.home",
				path: "home",
				element: (
					<React.Suspense fallback={null}>
						<UsersHomePage />
					</React.Suspense>
				),
			},
			{
				id: "users.profile",
				path: "users",
				element: (
					<React.Suspense fallback={null}>
						<ProfilePage />
					</React.Suspense>
				),
			},
		],
	},
];
