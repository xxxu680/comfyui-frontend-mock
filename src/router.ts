import {
  createRouter,
  createWebHashHistory,
  createWebHistory
} from 'vue-router'

import { isCloud, isDesktop } from '@/platform/distribution/types'
import { useTelemetry } from '@/platform/telemetry'
import { useUserStore } from '@/stores/userStore'
import LayoutDefault from '@/views/layouts/LayoutDefault.vue'

import { installPreservedQueryTracker } from '@/platform/navigation/preservedQueryTracker'
import { PRESERVED_QUERY_NAMESPACES } from '@/platform/navigation/preservedQueryNamespaces'

const cloudOnboardingRoutes: [] = []

const isFileProtocol = window.location.protocol === 'file:'

/**
 * Determine base path for the router.
 * - Electron: always root
 * - Cloud: use Vite's BASE_URL (configured at build time)
 * - Standard web (including reverse proxy subpaths): use window.location.pathname
 *   to support deployments like http://mysite.com/ComfyUI/
 */
function getBasePath(): string {
  if (isDesktop) return '/'
  if (isCloud) return import.meta.env?.BASE_URL || '/'
  return window.location.pathname
}

const basePath = getBasePath()

function trackPageView(): void {
  if (!isCloud || typeof window === 'undefined') return

  useTelemetry()?.trackPageView(document.title, {
    path: window.location.href
  })
}

const router = createRouter({
  history: isFileProtocol
    ? createWebHashHistory()
    : // Base path must be specified to ensure correct relative paths
      // Example: For URL 'http://localhost:7801/ComfyBackendDirect',
      // we need this base path or assets will incorrectly resolve from 'http://localhost:7801/'
      createWebHistory(basePath),
  routes: [
    ...(isCloud ? cloudOnboardingRoutes : []),
    {
      path: '/',
      component: LayoutDefault,
      children: [
        {
          path: '',
          name: 'GraphView',
          component: () => import('@/views/GraphView.vue'),
          beforeEnter: async (_to, _from, next) => {
            // Then check user store
            const userStore = useUserStore()
            await userStore.initialize()
            if (userStore.needsLogin) {
              next('/user-select')
            } else {
              next()
            }
          }
        },
        {
          path: 'user-select',
          name: 'UserSelectView',
          component: () => import('@/views/UserSelectView.vue')
        }
      ]
    }
  ],

  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

installPreservedQueryTracker(router, [
  {
    namespace: PRESERVED_QUERY_NAMESPACES.TEMPLATE,
    keys: ['template', 'source', 'mode']
  },
  {
    namespace: PRESERVED_QUERY_NAMESPACES.SHARE,
    keys: ['share']
  },
  {
    namespace: PRESERVED_QUERY_NAMESPACES.INVITE,
    keys: ['invite']
  },
  {
    namespace: PRESERVED_QUERY_NAMESPACES.CREATE_WORKSPACE,
    keys: ['create_workspace']
  },
  {
    namespace: PRESERVED_QUERY_NAMESPACES.OAUTH,
    keys: ['oauth_request_id']
  }
])

router.beforeEach((to, _from, next) => {
  if (to.path === '/cloud/login' || to.name === 'cloud-login') {
    next('/')
    return
  }
  next()
})

router.afterEach(() => {
  trackPageView()
})

export default router
