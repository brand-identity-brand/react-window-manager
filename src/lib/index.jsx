import WindowManagerRegistryProvider, { WindowManagerRegistryContext } from './context/WindowManagerRegistry';
import WindowManagerProvider, { WindowManagerContext } from './context/WindowManager';
import useWindowManager from './hooks/useWindowManager';

export default WindowManagerRegistryProvider
export {
    WindowManagerRegistryContext,
    WindowManagerContext,
    WindowManagerProvider,
    useWindowManager
}