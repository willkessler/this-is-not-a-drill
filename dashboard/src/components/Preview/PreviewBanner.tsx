import React, { useEffect, useState } from 'react';
import classes from './PreviewBanner.module.css';
import { renderMarkdown } from '../../lib/RenderMarkdown';
import { useNotifications } from '../Notifications/NotificationsContext';

const PreviewBanner = () => {
  const { isBannerVisible, bannerContent, closeBanner } = useNotifications();
  const [ isClosing, setIsClosing ] = useState();

    const handleClose = () => {
        setIsClosing(true); // start closing animation
    };

    useEffect(() => {
        // Automatically start closing after 5 seconds
        const autoCloseTimer = setTimeout(() => {
            if (isBannerVisible && !isClosing) {
                setIsClosing(true);
            }
        }, 5000); // 5 seconds

        // Cleanup timer
        return () => clearTimeout(autoCloseTimer);
    }, [isBannerVisible, isClosing]);

    useEffect(() => {
        if (isClosing) {
            const animationTimer = setTimeout(() => {
                closeBanner(); // Call after 5 seconds
                setIsClosing(false); // reset closing state for next go round
            }, 250);


            return () => clearTimeout(animationTimer);
        }
    }, [isClosing, closeBanner]);

    const previewCaveat = "\n\n#### _Please note: this is only a demo, how you display notifications on your site is up to you._";
  const caveatedBannerContent = renderMarkdown(bannerContent,true);
    return (
        isBannerVisible && (
            <div
              className={`${classes.banner} ${isClosing ? classes.slideUp : ''}`}
              onAnimationEnd={() => isClosing && closeBanner()}
            >
              <span dangerouslySetInnerHTML={caveatedBannerContent}></span>
              <button className={classes.closeButton} onClick={handleClose}>X</button>
            </div>
        )
    );
};

export default PreviewBanner;