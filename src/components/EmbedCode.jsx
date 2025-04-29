import { Box } from '@sanity/ui'
import { useEffect, useState } from 'react';

function EmbedCode({asset}) {
    const [templateId, handleTemplateId] = useState('A4HAcLOLOO68');

    useEffect(() => {
        if (asset) {
            switch (asset._type) {
                case 'video':
                    handleTemplateId('A4HAcLOLOO68');
                    break;
                case 'image':
                    handleTemplateId('A8AAFV8a-H5b');
                    break;
                case 'music':
                    handleTemplateId('AEFALSr3trK4');
                    break;
                case 'unknown':
                    handleTemplateId('AYFACCtYYllw');
                    break;
                default:
                    handleTemplateId('A4HAcLOLOO68');
            }
        }
    }, [asset]);

    useEffect(() => {
        const loadScripts = async () => {
            try {
                await loadScript('//rtcdn.cincopa.com/meta_json.aspx?fid=' + templateId + '!' + asset?._ref + '&ver=v2&id=cincopa_' + templateId + asset?._ref);

                // Load the second script after the first one finishes
                await loadScript('//rtcdn.cincopa.com/libasync.js');

            } catch (error) {
                console.error("Error loading scripts:", error);
            }
        };

        loadScripts();
    }, [asset]); 
    
    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (err) => reject(new Error(`Script load error: ${src}`));
        document.body.appendChild(script);
        });
    };

    return (
        <>
            <Box>
                <div 
                    className='gallerydemo cincopa-fadein'
                    id={`cincopa_${templateId}${asset?._ref}`} 
                    style={{
                        maxWidth: '100%',
                        width: '100%',
                        height: 'auto',
                    }}
                >
                    <div style={{
                            display: 'flex',
                            maxWidth: '100%',
                            width: '100%',
                            height: 'auto',
                        }}
                    >
                        <img 
                            src={`https://rtcdn.cincopa.com/thumb.aspx?fid=${templateId}!${asset?._ref}&size=large`}
                            alt='Thumbnail'
                            style={{
                                filter: 'blur(5px)',
                                objectFit: 'contain',
                                width: '100%',
                                aspectRatio: '1.90',
                                padding: 0,
                                margin: 0,
                            }}
                        />
                    </div>
                </div>
            </Box>
        </>  
    )
}

export default EmbedCode