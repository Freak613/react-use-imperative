import React, { useContext, useState } from 'react';

export const RenderPointContext = React.createContext();
export const useRenderPoint = () => useContext(RenderPointContext);
export const RenderPointProvider = ({ children }) => {
    const [state, setState] = useState(null);
    return React.createElement(
        RenderPointContext.Provider,
        { value: setState },
        state !== null ? state : children
    );
};
