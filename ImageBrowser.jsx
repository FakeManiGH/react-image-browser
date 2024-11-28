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
        onSwipedDown: () => setInfo(false),
        preventDefaultTouchmoveEvent: true,
        trackMouse: false,
        delta: 10,
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
                        <button data-hover='Slides' className={layout === 'slides' ? 'active' : ''} onClick={() => setLayout('slides')}>&#129112;</button>
                        <button data-hover='Grid' className={layout === 'grid' ? 'active' : ''} onClick={() => setLayout('grid')}>&#x25a6;</button>
                    </nav>

                    <nav className="button-group">
                        <button data-hover='Slideshow' className={slidemenu ? 'active' : ''} onClick={toggleSlidemenu}>&#11118;</button>
                        <button data-hover='Info' className={info ? 'active' : ''} onClick={toggleInfo}>&#128712;</button>
                        <button data-hover='Fullscreen' className={fullscreen ? 'active' : ''} onClick={toggleFullscreen}>&#9974;</button>
                        <button data-hover='Close' className='close' onClick={() => setOverlay(false)}>&#10006;</button>
                    </nav>
                </div>
            
                <div className="main-container" {...handlers}>
                {layout === 'slides' && (
                    <>
                    <div className="slides">
                        <div className='slide-container' style={{ height: fullscreen ? '100%' : '' }}>
                            <button className='prev' onClick={previousImage}>&#10094;</button>
                            <img 
                                src={selectedImage.url} 
                                alt={selectedImage.description}
                                onDoubleClick={toggleFullscreen}
                                onWheel={(e) => {
                                    if (e.deltaY > 0) nextImage();
                                    else previousImage();
                                }}
                            />
                            <button className='next' onClick={nextImage}>&#10095;</button>
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
                            <button className='prev' onClick={previousImage}>&#10094;</button>
                            <img 
                                src={selectedImage.url} 
                                alt={selectedImage.description} 
                                onDoubleClick={toggleFullscreen}
                                onWheel={(e) => {
                                    if (e.deltaY > 0) nextImage();
                                    else previousImage();
                                }}
                            />
                            <button className='next' onClick={nextImage}>&#10095;</button>
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
                            <button onClick={() => setSlideShow(true)}>Start</button>
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
                            <button onClick={previousImage}>&#10094;</button>
                            {!pauseSlideshow ? (
                                <button onClick={() => setPauseSlideshow(true)}>&#10074;&#10074;</button>
                            ) : (
                                <button onClick={() => setPauseSlideshow(false)}>&#9654;</button>
                            )}
                            <button onClick={nextImage}>&#10095;</button>
                            <button onClick={toggleRealFullscreen}>&#9974;</button>
                            <button onClick={endSlideshow}>&#10006;</button>
                        </div>
                    </div>
                ) : (null)}
            </div>
        )}
        </>
    );
};

export default ImageBrowser;