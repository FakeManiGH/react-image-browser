/* This is a typescript definition file for the ImageBrowser component */

import { ReactNode } from 'react';

interface Image {
    url: string;
    description?: string;
    title?: string;
    date?: string;
    location?: string;
}

interface ImageBrowserProps {
    images: Image[];
    button?: ReactNode;
    open?: string;
    action?: boolean;
}

declare const ImageBrowser: (props: ImageBrowserProps) => JSX.Element;

export default ImageBrowser;