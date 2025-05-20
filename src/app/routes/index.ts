import { Router } from "express";
import bikeRoutes from "../modules/bikes/bike.route";
import authRouter from "../modules/auth/auth.router";
import orderRoutes from "../modules/orders/order.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/products",
    route: bikeRoutes,
  },
  {
    path: "/auth",
    route: authRouter,
  },
  {
    path:"/orders",
    route:orderRoutes
},
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
