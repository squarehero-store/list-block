(function () {
    function cleanSVG(svgString) {
        // Remove the xmlns attribute
        svgString = svgString.replace(/\sxmlns="[^"]*"/g, '');

        // Remove any remaining http:="" or www.w3.org="" attributes
        svgString = svgString.replace(/\s(http:|www\.w3\.org)="[^"]*"/g, '');

        // Remove any remaining id attributes
        svgString = svgString.replace(/\sid="[^"]*"/g, '');

        // Remove any &gt; at the end of the opening svg tag
        svgString = svgString.replace(/<svg([^>]*)&gt;/, '<svg$1>');

        return svgString;
    }

    function transformAccordionToListBlock(section, columnCount, style) {
        const accordion = section.querySelector('.accordion-items-container');

        if (accordion) {
            const listBlockContainer = document.createElement('div');
            listBlockContainer.className = `list-block-container accordion-list columns-${columnCount}`;
            if (style === 'icons') {
                listBlockContainer.classList.add('style-icons');
            }

            const items = accordion.querySelectorAll('.accordion-item');

            items.forEach((item) => {
                const listBlockItem = document.createElement('div');
                listBlockItem.className = 'list-block-item preFade';
                if (style === 'card') {
                    listBlockItem.classList.add('style-card');
                } else if (style === 'icons') {
                    listBlockItem.classList.add('style-icons');
                }

                const titleWrapper = item.querySelector('.accordion-item__title-wrapper');
                const descriptionElement = item.querySelector('.accordion-item__description');

                let title = '';
                let titleTag = 'div'; // Default to div if no header tag is found
                if (titleWrapper) {
                    titleTag = titleWrapper.tagName.toLowerCase();
                    const titleSpan = titleWrapper.querySelector('.accordion-item__title');
                    title = titleSpan ? titleSpan.textContent.trim() : titleWrapper.textContent.trim();
                }

                let description = '';
                let iconContent = null;

                if (descriptionElement) {
                    const content = descriptionElement.innerHTML;
                    const imageMatch = content.match(/https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg)/i);
                    if (imageMatch) {
                        const imgTag = `<img src="${imageMatch[0]}" alt="${title}" />`;
                        if (style === 'icons') {
                            iconContent = imgTag;
                            description = content.replace(imageMatch[0], '').trim();
                        } else {
                            description = content.replace(imageMatch[0], imgTag);
                        }
                    } else {
                        description = content;
                    }
                }

                let contentHtml = '';
                if (style === 'icons') {
                    contentHtml = `
                        <div class="list-block-item__content">
                            ${iconContent ? `<div class="list-block-item__icon">${iconContent}</div>` : ''}
                            <div class="list-block-item__text-wrapper">
                                <${titleTag} class="list-block-item__title">${title}</${titleTag}>
                                <div class="list-block-item__description">${description}</div>
                            </div>
                        </div>
                    `;
                } else {
                    contentHtml = `
                        <${titleTag} class="list-block-item__title">${title}</${titleTag}>
                        <div class="list-block-item__description">${description}</div>
                    `;
                }

                listBlockItem.innerHTML = contentHtml;

                listBlockContainer.appendChild(listBlockItem);
            });

            const accordionParent = accordion.closest('.sqs-block-content');

            if (accordionParent) {
                accordionParent.innerHTML = '';
                accordionParent.appendChild(listBlockContainer);

                setTimeout(() => {
                    listBlockContainer.querySelectorAll('.preFade').forEach(element => {
                        element.classList.add('fadeIn');
                        element.style.opacity = '1';
                    });
                }, 100);
            }
        }
    }

    function processSections() {
        const globalMetaTag = document.querySelector('meta[squarehero-plugin="list-block"]');
        if (!globalMetaTag || globalMetaTag.getAttribute('enabled') !== 'true') {
            return;
        }

        const sections = document.querySelectorAll('.page-section');
        let transformedCount = 0;
        sections.forEach(section => {
            const sectionMetaTag = section.querySelector('meta[squarehero-feature="list-block"]');
            if (sectionMetaTag) {
                const columns = sectionMetaTag.getAttribute('columns') || '3';
                const style = sectionMetaTag.getAttribute('style') || '';
                transformAccordionToListBlock(section, columns, style);
                transformedCount++;
            }
        });
        if (transformedCount > 0) {
            console.log(`🚀 SquareHero.store List Block plugin loaded (${transformedCount} block${transformedCount > 1 ? 's' : ''} transformed)`);
        }
    }

    window.addEventListener('load', function () {
        setTimeout(processSections, 500);
    });

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const addedNodes = mutation.addedNodes;
                addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('page-section')) {
                        const sectionMetaTag = node.querySelector('meta[squarehero-feature="list-block"]');
                        if (sectionMetaTag) {
                            const columns = sectionMetaTag.getAttribute('columns') || '3';
                            const style = sectionMetaTag.getAttribute('style') || '';
                            transformAccordionToGrid(node, columns, style);
                        }
                    }
                });
            }
        });
    });

    function startObserver() {
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        } else {
            setTimeout(startObserver, 100);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startObserver);
    } else {
        startObserver();
    }
})();