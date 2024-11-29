/**
 * ImageBrowser Component
 * 
 * This component is licensed under the MIT License.
 * 
 * Original code written by Timo Anjala.
 * 
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import PropTypes from 'prop-types';
import './ImageBrowser.css';

const ImageBrowser = ({ images, button, open, actions }) => {
    const [overlay, setOverlay] = useState(false);
    const [layout, setLayout] = useState(open == 'grid' ? 'grid' : 'slides');
    const [info, setInfo] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(images[0]);
    const imageRefs = useRef([]);

    // Slideshow states
    const [interval, setInterval] = useState(5);
    const [slideIndex, setSlideIndex] = useState(0);
    const [slidemenu, setSlidemenu] = useState(false);
    const [slideShow, setSlideShow] = useState(false);
    const [pauseSlideshow, setPauseSlideshow] = useState(false);

    // Next image
    const nextImage = useCallback(() => {
        const index = slideIndex - 1;
        setSelectedImage(images[(index + 1) % images.length]);
    }, [images, slideIndex]);

    // Previous image
    const previousImage = useCallback(() => {
        const index = slideIndex - 1;
        setSelectedImage(images[(index + images.length - 1) % images.length]);
    }, [images, slideIndex]);

    // Toggle info
    const toggleInfo = useCallback(() => {
        setSlidemenu(false);
        setInfo(!info);   
    }, [info, setSlidemenu]);

    // Toggle slideshow
    const toggleSlidemenu = useCallback(() => {
        setInfo(false);
        setSlidemenu(!slidemenu);
    }, [slidemenu, setInfo]);

    // End slideshow
    const endSlideshow = () => {
        setSlideShow(false);
        setPauseSlideshow(false);
        if (document.fullscreenElement) document.exitFullscreen();
    };

    // Fullscreen
    const toggleFullscreen = useCallback(() => {
        setFullscreen(!fullscreen);
    }, [fullscreen]);

    // Real fullscreen
    const toggleRealFullscreen = () => {
        const elem = document.querySelector('.image-browser');
        if (document.fullscreenElement) document.exitFullscreen();
        else elem.requestFullscreen();
    };

    // Swipe handlers
    const handlers = useSwipeable({
        onSwipedLeft: () => nextImage(),
        onSwipedRight: () => previousImage(),
        onSwipedUp: () => setInfo(true),
        preventDefaultTouchmoveEvent: true,
        trackMouse: false,
        delta: 25,
    });

    // EFFECTS
    useEffect(() => { 
        // If images is empty, return
        if (images.length === 0) {
            setOverlay(false);
            alert('Add images to ImageBrowser component or remove component from page.');
        }
        
        const index = slideIndex - 1;
        if (imageRefs.current[index]) {
            imageRefs.current[index].scrollIntoView({ behavior: 'smooth', inline: 'center' });
        }

        // Disable scrolling when overlay is open
        if (overlay) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        // SlideIndex
        setSlideIndex(images.findIndex((image) => image === selectedImage) + 1)

        // Slideshow
        if (slideShow && !pauseSlideshow) {
            const timer = setTimeout(() => {
                nextImage();
            }, interval * 1000);
            return () => {
                clearTimeout(timer);
            };
        }

        // Keyboard navigation
        const handleKeyDown = (event) => {
            if (overlay) {
                switch (event.key) {
                    case 'ArrowRight':
                        nextImage();
                        break;
                    case 'ArrowLeft':
                        previousImage();
                        break;
                    case 'Escape':
                        if (slideShow) setSlideShow(false);
                        else if (slidemenu) setSlidemenu(false);
                        else if (info) setInfo(false);
                        else if (fullscreen) setFullscreen(false);
                        else setOverlay(false);
                        break;
                    case 'i':
                        toggleInfo();
                        break;
                    case 'p':
                        toggleSlidemenu();
                        break;
                    case 'Enter':
                        toggleFullscreen();
                        break;
                    case 'space':
                        if (slideShow) setPauseSlideshow(!pauseSlideshow);
                        break;
                    default:
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [
        selectedImage, 
        images, 
        overlay, 
        fullscreen, 
        info, 
        slidemenu,
        slideIndex,
        slideShow,
        interval,
        pauseSlideshow,
        nextImage, 
        previousImage, 
        toggleInfo, 
        toggleFullscreen, 
        setSlidemenu,
        setSlideIndex,
        toggleSlidemenu,
    ]);

    // ImageBrowser open button (func)
    const openOverlay = () => {
        setOverlay(true);
        setSelectedImage(images[0]);
    };

    // If no images, return null
    if (!images || images.length === 0) return null;

    return (
        <>  
        {button ? (
            <button className='open-button' onClick={openOverlay}>{button}</button>
        ) : (
            <div className='page-image-grid'>
                {images.map((image, index) => (
                    <img
                        key={index}
                        src={image.url}
                        alt={image.description}
                        onClick={() => {
                            setOverlay(true);
                            setSelectedImage(image);
                        }}
                    />
                ))}
            </div>
        )}

        {overlay && (
            <div className="image-browser">
                <div className="browser-navigation">
                    <nav className="button-group">
                        <button className={layout === 'slides' ? 'active' : ''} onClick={() => setLayout('slides')}>
                            <svg width='1.2rem' height='1.2rem' viewBox="0 0 16 16" fill='currentColor'>
                                <path d="M9.25 6.12V4.87h-7l3-2.05-.71-1L.59 4.45A1.29 1.29 0 0 0 0 5.5a1.29 1.29 0 0 0 .59 1l3.93 2.72.71-1-3-2.06zm6.16 3.33-3.93-2.67-.71 1 3 2.06h-7v1.25h7.03l-3 2 .71 1 3.93-2.67a1.23 1.23 0 0 0 0-2.1z"/>
                            </svg>
                        </button>
                        <button className={layout === 'grid' ? 'active' : ''} onClick={() => setLayout('grid')}>
                            <svg width='1.2rem' height='1.2rem' viewBox="0 0 240 240" fill='currentColor'>
                                <rect width="60" height="60"/>
                                <rect y="90" width="60" height="60"/>
                                <rect y="180" width="60" height="60"/>
                                <rect x="180" width="60" height="60"/>
                                <rect x="180" y="180" width="60" height="60"/>
                                <rect x="90" y="90" width="60" height="60"/>
                                <rect x="180" y="90" width="60" height="60"/>
                                <rect x="90" y="180" width="60" height="60"/>
                                <rect x="90" width="60" height="60"/>
                            </svg>
                        </button>
                    </nav>

                    <nav className="button-group">
                        <button className={slidemenu ? 'active' : ''} onClick={toggleSlidemenu}>
                            <svg width='1.2rem' height='1.2rem' viewBox="0 0 275 250" fill='currentColor'>
                                <path d="m0,0v250h275V0H0Zm239.63,20h0c8.49,0,15.37,6.88,15.37,15.37v25.74c0,8.49-6.88,15.37-15.37,15.37h0c-8.49,
                                0-15.37-6.88-15.37-15.37v-25.74c0-8.49,6.88-15.37,15.37-15.37Zm0,76.47h0c8.49,0,15.37,6.88,15.37,15.37v26.02c0,
                                8.49-6.88,15.37-15.37,15.37h0c-8.49,0-15.37-6.88-15.37-15.37v-26.02c0-8.49,6.88-15.37,15.37-15.37ZM70.74,
                                20h133.52v95H70.74V20Zm-35.37,0h0c8.49,0,15.37,6.88,15.37,15.37v26.02c0,8.49-6.88,15.37-15.37,15.37h0c-8.49,
                                0-15.37-6.88-15.37-15.37v-26.02c0-8.49,6.88-15.37,15.37-15.37Zm0,76.76h0c8.49,0,15.37,6.88,15.37,15.37v26.02c0,
                                8.49-6.88,15.37-15.37,15.37h0c-8.49,0-15.37-6.88-15.37-15.37v-26.02c0-8.49,6.88-15.37,15.37-15.37Zm-15.37,
                                117.87v-25.74c0-8.49,6.88-15.37,15.37-15.37h0c8.49,0,15.37,6.88,15.37,15.37v25.74c0,8.49-6.88,15.37-15.37,
                                15.37h0c-8.49,0-15.37-6.88-15.37-15.37Zm50.74,15.37v-95h133.52v95H70.74Zm153.52-15.37v-26.02c0-8.49,6.88-15.37,
                                15.37-15.37h0c8.49,0,15.37,6.88,15.37,15.37v26.02c0,8.49-6.88,15.37-15.37,15.37h0c-8.49,0-15.37-6.88-15.37-15.37Z"/>
                            </svg>
                        </button>
                        <button className={info ? 'active' : ''} onClick={toggleInfo}>
                            <svg width='1.2rem' height='1.2rem' viewBox="0 0 250 250" fill='currentColor'>
                                <path d="m125,0C56.07,0,0,56.07,0,125s56.07,125,125,125,125-56.07,125-125S193.93,0,125,0Zm0,233.21c-59.67,0-108.21-48.54-108.21-108.21S65.33,16.79,125,16.79s108.21,48.54,108.21,108.21-48.54,108.21-108.21,108.21Z"/>
                                <polygon points="90.02 115.41 101.68 115.41 101.68 190.48 90.02 190.48 90.02 211.25 159.98 211.25 159.98 190.48 148.32 190.48 148.32 115.41 159.98 115.41 159.98 94.64 90.02 94.64 90.02 115.41"/>
                                <circle cx="125" cy="57.93" r="23.32"/>
                            </svg>
                        </button>
                        <button className={fullscreen ? 'active' : ''} onClick={toggleFullscreen}>
                            {!fullscreen ? (
                                <svg width='1rem' height='1rem' viewBox="0 0 250 250" fill='currentColor'>
                                    <polygon points="80.92 0 .25 0 .25 80.75 33.24 47.73 97.65 112.2 112.35 97.5 47.93 33.02 80.92 0"/>
                                    <polygon points="96.39 139.05 33.11 202.4 0 169.25 0 250 80.67 250 47.81 217.11 111.09 153.75 96.39 139.05"/>
                                    <polygon points="153.73 138.93 139.03 153.63 202.32 216.98 169.33 250 250 250 250 169.25 217.01 202.27 153.73 138.93"/>
                                    <polygon points="169.33 0 202.32 33.02 137.78 97.63 152.48 112.33 217.01 47.73 250 80.75 250 0 169.33 0"/>
                                </svg>
                            ) : (
                                <svg width='1rem' height='1rem' viewBox="0 0 250 250" fill='currentColor'>
                                    <polygon points="209.66 134.48 134.47 134.48 134.47 209.65 165.19 178.94 236.19 249.93 249.94 236.18 178.94 165.2 209.66 134.48"/>
                                    <polygon points="178.88 84.85 250 13.74 236.25 0 165.13 71.1 134.41 40.39 134.41 115.56 209.6 115.56 178.88 84.85"/>
                                    <polygon points="40.32 115.56 115.51 115.56 115.51 40.39 84.79 71.1 13.78 .11 .03 13.85 71.04 84.85 40.32 115.56"/>
                                    <polygon points="71.08 165.2 0 236.26 13.75 250 84.82 178.94 115.55 209.65 115.55 134.48 40.36 134.48 71.08 165.2"/>
                                </svg>
                            )}
                        </button>
                        <button className='close' onClick={() => setOverlay(false)}>
                            <svg width='1rem' height='1rem' viewBox="0 0 250 250" fill='currentColor'>
                                <path d="m142.68,125L246.34,21.34c4.88-4.88,4.88-12.8,0-17.68h0c-4.88-4.88-12.8-4.88-17.68,0l-103.66,103.66L21.34,3.66C16.46-1.22,8.54-1.22,3.66,3.66c-4.88,4.88-4.88,12.8,0,17.68l103.66,103.66L3.66,228.66c-4.88,4.88-4.88,12.8,0,17.68,4.88,4.88,12.8,4.88,17.68,0l103.66-103.66,103.66,103.66c4.88,4.88,12.8,4.88,17.68,0h0c4.88-4.88,4.88-12.8,0-17.68l-103.66-103.66Z"/>
                            </svg>
                        </button>
                    </nav>
                </div>
            
                <div className="main-container" {...handlers}>
                {layout === 'slides' && (
                    <>
                    <div className="slides">
                        <div className='slide-container' style={{ height: fullscreen ? '100%' : '' }}>
                            <button className='prev' onClick={previousImage}>
                                <svg width='1.3rem' height='1.3rem' viewBox="0 0 24 24" fill='currentColor'>
                                    <polygon points="17.2,23.7 5.4,12 17.2,0.3 18.5,1.7 8.4,12 18.5,22.3"/>
                                </svg>
                            </button>
                            <img 
                                src={selectedImage.url} 
                                alt={selectedImage.description}
                                onDoubleClick={toggleFullscreen}
                                onWheel={(e) => {
                                    if (e.deltaY > 0) nextImage();
                                    else previousImage();
                                }}
                            />
                            <button className='next' onClick={nextImage}>
                                <svg width='1.3rem' height='1.3rem' viewBox="0 0 24 24" fill='currentColor'>
                                    <polygon points="6.8,23.7 5.4,22.3 15.7,12 5.4,1.7 6.8,0.3 18.5,12"/>
                                </svg>
                            </button>
                        </div>
                    
                    {!fullscreen && (
                        <div className='image-slider' onWheel={(e) => {
                            if (e.deltaY > 0) nextImage();
                            else previousImage();
                        }}>
                            {images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image.url}
                                    alt={image.description}
                                    className={image === selectedImage ? 'active' : ''}
                                    onClick={() => setSelectedImage(image)}
                                    ref={(el) => (imageRefs.current[index] = el)}
                                />
                            ))}
                        </div>
                    )}
                    </div>
                    </>
                )}

                {layout === 'grid' && (
                    <div className='grid-container'>
                    {!fullscreen ? (
                        <div className="grid">
                            {images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image.url}
                                    alt={image.description}
                                    className={image === selectedImage ? 'active' : ''}
                                    onClick={() => setSelectedImage(image)}
                                    onDoubleClick={toggleFullscreen}
                                    ref={(el) => (imageRefs.current[index] = el)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className='image-container'>
                            <button className='prev' onClick={previousImage}>
                                <svg width='1.3rem' height='1.3rem' viewBox="0 0 24 24" fill='currentColor'>
                                    <polygon points="17.2,23.7 5.4,12 17.2,0.3 18.5,1.7 8.4,12 18.5,22.3"/>
                                </svg>
                            </button>
                            <img 
                                src={selectedImage.url} 
                                alt={selectedImage.description} 
                                onDoubleClick={toggleFullscreen}
                                onWheel={(e) => {
                                    if (e.deltaY > 0) nextImage();
                                    else previousImage();
                                }}
                            />
                            <button className='next' onClick={nextImage}>
                                <svg width='1.3rem' height='1.3rem' viewBox="0 0 24 24" fill='currentColor'>
                                    <polygon points="6.8,23.7 5.4,22.3 15.7,12 5.4,1.7 6.8,0.3 18.5,12"/>
                                </svg>
                            </button>
                        </div>
                    )}
                    </div>
                )}

                {info && (
                    <div className="image-info">
                        <h2>{selectedImage.title}</h2>
                        <p>&copy; {selectedImage.author ? selectedImage.author : 'Unknown'}</p>
                        <hr />
                        <div className="infobox">
                            <p><strong>Description</strong></p>
                            <p className='faded'>{selectedImage.description ? selectedImage.description : 'No description available'}</p>
                        </div>
                        <div className="infobox">
                            <p><strong>Date</strong></p>
                            <p className='faded'>{selectedImage.date ? selectedImage.date : 'No date available'}</p>
                        </div>
                        <div className="infobox">
                            <p><strong>Location</strong></p>
                            <p className='faded'>{selectedImage.location ? selectedImage.location : 'No location available'}</p>
                        </div>

                        <hr />
                        {actions && (

                            /* Add your own actions here */
                            <nav className='button-group'>
                                <button className='small'>&#10084; Like</button>
                                <button className='small'>&#8618; Share</button>
                                <button className='small'>&#128490; Comment</button>
                            </nav>
                        )}
                    </div>
                )}

                {slidemenu && (
                    <div className="slideshow-menu">
                        <h2>Automated slideshow</h2>
                        <p>Play automated slideshow on fullscreen</p>
                        <div className='infobox'>
                            <label htmlFor='interval'><strong>Image interval</strong></label>
                            <input 
                                type='range' 
                                id='interval' 
                                min='1' 
                                max='10' 
                                step='1' 
                                defaultValue='5'
                                onChange={(e) => setInterval(e.target.value)}
                            />
                            <p><strong>{interval}</strong> second</p>
                        </div>
                        <div className='infobox'>
                            <label htmlFor='startImage'><strong>Start from image</strong></label>
                            <select id='startImage' defaultValue={slideIndex - 1} onChange={(e) => setSelectedImage(images[e.target.value])}>
                                {images.map((image, index) => (
                                    <option key={index} value={index}>{index + 1}. {image.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className='button-group'>
                            <button onClick={() => setSlideShow(true)}>
                                <svg width='1.2rem' height='1.2rem' viewBox="0 0 250 250" fill='currentColor'>
                                    <polygon points="0,0 0,250 250,125"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
                </div>
                <div className="footer">
                    <p className='noWrap'>{slideIndex} of {images.length}</p>
                    <p>{selectedImage.title} &copy; <strong>{selectedImage.author ? selectedImage.author : 'Unknown'}</strong></p>
                </div>

                {slideShow ? (
                    <div className='slideshow'>
                        <img src={selectedImage.url} alt={selectedImage.description} />
                        
                        <div className='slideshow-controls'>
                            <button onClick={previousImage}>
                                <svg width='1.2rem' height='1.2rem' viewBox="0 0 24 24" fill='currentColor'>
                                    <polygon points="17.2,23.7 5.4,12 17.2,0.3 18.5,1.7 8.4,12 18.5,22.3"/>
                                </svg>
                            </button>
                            {!pauseSlideshow ? (
                                <button onClick={() => setPauseSlideshow(true)}>
                                    <svg width='1.2rem' height='1.2rem' viewBox="0 0 175 250" fill='currentColor'>
                                        <rect x="0" y="0" width="60" height="250"/>
                                        <rect x="115" y="0" width="60" height="250"/>
                                    </svg>
                                </button>
                            ) : (
                                <button onClick={() => setPauseSlideshow(false)}>
                                    <svg width='1.2rem' height='1.2rem' viewBox="0 0 250 250" fill='currentColor'>
                                        <polygon points="0,0 0,250 250,125"/>
                                    </svg>
                                </button>
                            )}
                            <button onClick={nextImage}>
                                <svg width='1.2rem' height='1.2rem' viewBox="0 0 24 24" fill='currentColor'>
                                    <polygon points="6.8,23.7 5.4,22.3 15.7,12 5.4,1.7 6.8,0.3 18.5,12"/>
                                </svg>
                            </button>
                            <button onClick={toggleRealFullscreen}>
                                <svg width='1.2rem' height='1.2rem' viewBox="0 0 250 250" fill='currentColor'>
                                    <polygon points="80.92 0 .25 0 .25 80.75 33.24 47.73 97.65 112.2 112.35 97.5 47.93 33.02 80.92 0"/>
                                    <polygon points="96.39 139.05 33.11 202.4 0 169.25 0 250 80.67 250 47.81 217.11 111.09 153.75 96.39 139.05"/>
                                    <polygon points="153.73 138.93 139.03 153.63 202.32 216.98 169.33 250 250 250 250 169.25 217.01 202.27 153.73 138.93"/>
                                    <polygon points="169.33 0 202.32 33.02 137.78 97.63 152.48 112.33 217.01 47.73 250 80.75 250 0 169.33 0"/>
                                </svg>
                            </button>
                            <button onClick={endSlideshow}>
                                <svg width='1.2rem' height='1.2rem' viewBox="0 0 250 250" fill='currentColor'>
                                    <path d="m142.68,125L246.34,21.34c4.88-4.88,4.88-12.8,0-17.68h0c-4.88-4.88-12.8-4.88-17.68,0l-103.66,103.66L21.34,3.66C16.46-1.22,8.54-1.22,3.66,3.66c-4.88,4.88-4.88,12.8,0,17.68l103.66,103.66L3.66,228.66c-4.88,4.88-4.88,12.8,0,17.68,4.88,4.88,12.8,4.88,17.68,0l103.66-103.66,103.66,103.66c4.88,4.88,12.8,4.88,17.68,0h0c4.88-4.88,4.88-12.8,0-17.68l-103.66-103.66Z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                ) : (null)}
            </div>
        )}
        </>
    );
};

ImageBrowser.propTypes = {
    images: PropTypes.arrayOf(PropTypes.shape({
        url: PropTypes.string.isRequired,
        title: PropTypes.string,
        description: PropTypes.string,
        date: PropTypes.string,
        location: PropTypes.string,
        author: PropTypes.string,
    })),
    button: PropTypes.string,
    open: PropTypes.string,
    actions: PropTypes.bool,
};

export default ImageBrowser;