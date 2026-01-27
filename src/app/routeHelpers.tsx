import { Suspense, lazy, type ComponentType } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';

const LoadingFallback = () => (
    <div className="flex items-center justify-center w-full h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
);

/**
 * Creates a lazy-loaded route with error boundary and suspense
 * @param path - Route path
 * @param importFn - Dynamic import function for the component
 * @param routeName - Name for error boundary (defaults to path)
 */
export function createLazyRoute(
    path: string,
    importFn: () => Promise<{ default: ComponentType<any> }>,
    routeName?: string
): RouteObject {
    const Component = lazy(importFn);

    return {
        path,
        element: (
            <RouteErrorBoundary routeName={routeName || path}>
                <Suspense fallback={<LoadingFallback />}>
                    <Component />
                </Suspense>
            </RouteErrorBoundary>
        ),
    };
}

/**
 * Creates an index route (no path) with lazy loading
 * @param importFn - Dynamic import function for the component
 * @param routeName - Name for error boundary
 */
export function createLazyIndexRoute(
    importFn: () => Promise<{ default: ComponentType<any> }>,
    routeName: string
): RouteObject {
    const Component = lazy(importFn);

    return {
        index: true,
        element: (
            <RouteErrorBoundary routeName={routeName}>
                <Suspense fallback={<LoadingFallback />}>
                    <Component />
                </Suspense>
            </RouteErrorBoundary>
        ),
    };
}

/**
 * Creates multiple routes from a configuration array
 * @param routes - Array of route configurations
 */
export function createRoutes(
    routes: Array<{
        path: string;
        import: () => Promise<{ default: ComponentType<any> }>;
        name?: string;
    }>
): RouteObject[] {
    return routes.map(({ path, import: importFn, name }) =>
        createLazyRoute(path, importFn, name)
    );
}
