/**
 * Created by Liu.Jun on 2020/5/13 8:47 下午.
 */

const routes = [  
    {
        path: '/design',
        name: 'design',
        meta: {
            title: 'design'
        },
        component: () => import('./views/design'),
    },
    {
        path: '/apis',
        name: 'apis',
        meta: {
            title: 'apis'
        },
        component: () => import('./views/apis'),
    },
    {
        path: '/examples',
        name: 'examples',
        meta: {
            title: 'examples'
        },
        component: () => import('./views/examples'),
    },
    {
        path: '/',
        hidden: true,
        redirect: {
            name: 'design',
            query: { 
            }
        }
    }
];

export default routes;
