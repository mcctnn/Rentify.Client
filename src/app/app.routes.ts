import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path:"login",
        loadComponent:()=>import("./pages/login/login.component")
    },
    {
        path:"",
        loadComponent:()=>import("./layout/layout.component"),
        canActivateChild:[authGuard],
        children:[
            {
                path:"",
                loadComponent: () => import("./pages/home/home.component")
            },
            {
                path:"categories",
                children:[
                    {
                        path:"",
                        loadComponent:()=>import("./pages/categories/categories.component").then((m)=>m.CategoriesComponent)
                    },
                    {
                        path:"create",
                        loadComponent:()=>import("./pages/categories/create/create-category.component").then((m)=>m.CreateCategoryComponent)
                    }
                ]        
            },
            {
                path:"items",
                children:[
                    {
                        path:"",
                        loadComponent:()=>import("./pages/item/item.component").then((m)=>m.ItemComponent)
                    },
                    {
                        path:"create",
                        loadComponent:()=>import("./pages/item/create/create-item.component").then((m)=>m.CreateItemComponent)
                    }
                ]
            }
        ]
    }
];
