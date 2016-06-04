// =========================
// Tool functions
// =========================

const dataURItoBlobData = function (dataURI) {
    const binary = atob(dataURI.split(',')[1]), array = [];
    for(let i = 0, c = binary.length; i < c; i++) array.push(binary.charCodeAt(i));
    return new Uint8Array(array);
};


const getTemplateInstanceByDOM = function (domElemQuetySelector) {
    const blazeView = Blaze.getView(document.querySelector(domElemQuetySelector));
    return blazeView && blazeView.templateInstance();
};

const openModal = function (e, tmpl, modalTemplate) {
    e.preventDefault();
    tmpl.modalTemplate.set(modalTemplate);
    document.body.parentElement.style.overflow = 'hidden';
    tmpl.modalActive.set(true);
};

const closeModal = function () {
    const tmpl = getTemplateInstanceByDOM('.jumbo');
    document.body.parentElement.style.overflow = 'auto';
    tmpl.modalActive.set(false);
};

const blockLetters = function (e) {
    const checkKey = (e.keyCode === 46 || e.keyCode === 8 || (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105));
    if (!checkKey) {
        e.currentTarget.value = '';
    }
};

const changeLogoColor = function (e, tmpl, query) {
    const value = e.currentTarget.value;
    if (value && /^#(?:[0-9a-f]{3}){1,2}$/i.test(value)) {
        tmpl.$('.logo-custom svg').find(query).css('fill', value);
    }
};


// =========================
// Template: main
// =========================


Template.main.onCreated(function () {
    this.modalActive = new ReactiveVar(false);
    this.modalTemplate = new ReactiveVar('');
});
Template.main.events({
    'click .js-choose-color'(e, tmpl) {
        openModal(e, tmpl, 'colorTmpl');
    },
    'click .js-set-up-svg'(e, tmpl) {
        openModal(e, tmpl, 'svgTmpl');
    },
    'click .js-set-up-png'(e, tmpl) {
        openModal(e, tmpl, 'pngTmpl');
    },
    'click .js-close-modal'(e, tmpl) {
        tmpl.modalActive.set(false);
        document.body.parentElement.style.overflow = 'auto';
    },
    'click .js-download-svg-logo'(e, tmpl) {
        e.preventDefault();
        const svgElem = document.querySelector('#meteor-logo-svg svg');
        const doc = new XMLSerializer().serializeToString(svgElem);
        saveAs(new Blob([doc], {type: 'image/svg+xml;charset=utf-8'}), 'meteor-logo.svg');
    },
    'click .js-download-switch-logo'(e) {
        e.preventDefault();
        const logoTmpl = Session.get('activeSVGTemplate');
        if (typeof logoTmpl === 'undefined' ||logoTmpl === 'logoSVG') {
            Session.set('activeSVGTemplate', 'logoTextSVG');
        }
        if (logoTmpl === 'logoTextSVG') {
            Session.set('activeSVGTemplate', 'logoSVG');
        }
    },
});
Template.main.helpers({
    isModalActive() {
        const tmpl = Template.instance();
        return tmpl.modalActive.get();
    },
    logoTypeClass() {
        return Session.get('activeSVGTemplate') || 'logoSVG';
    },
});


// =========================
// Template: modal
// =========================


Template.modal.helpers({
    modalTemplate() {
        const mainTmpl = getTemplateInstanceByDOM('.jumbo');
        return mainTmpl.modalTemplate.get() || '';
    },
});


// =========================
// Template: colorTmpl
// =========================

Template.registerHelper('is', function (a, b) {
    return a === b;
});

Template.colorTmpl.helpers({
    isOnlyLogo() {
        const typeOfLogo = Session.get('activeSVGTemplate');
        if (typeof typeOfLogo === 'undefined' || typeOfLogo === 'logoSVG') {
            return true;
        }
    },
});

Template.colorPicker.events({
    'change .js-choose-text-color'(e) {
        const parentTemplate = getTemplateInstanceByDOM('.modal-color-template');
        changeLogoColor(e, parentTemplate, 'g:eq(1) path');
    },
    'change .js-choose-logo-color'(e, tmpl) {
        const parentTemplate = getTemplateInstanceByDOM('.modal-color-template');
        changeLogoColor(e, parentTemplate, 'g:eq(0) path');
    },
});

Template.colorTmpl.events({
    'change .js-choose-all-color'(e, tmpl) {
        changeLogoColor(e, tmpl, 'path');
    },
    'click .js-logo-choose-all'(e) {
        const svgPath = $(e.currentTarget).find('svg path');
        const fill = svgPath.length && svgPath.css('fill');
        if (fill) {
            $('#meteor-logo-svg svg').find('path').css('fill', fill);
            closeModal();
        }
    },
    'click .js-logo-text-choose'(e) {
        
        let $g = $(e.currentTarget).find('svg g');
        const $svgPathLogo = $g.eq(0).find('path');
        const $svgPathText = $g.eq(1).find('path');
        
        const fillText = svgPathText.length && svgPathText.css('fill');
        const fillLogo = svgPathLogo.length && svgPathLogo.css('fill');

        if (fillText && fillLogo) {
            $g = $('#meteor-logo-svg svg g');
            $g.eq(0).find('path').css('fill', fillLogo);
            $g.eq(1).find('path').css('fill', fillText);
            
            closeModal();
        }
    },
});


// =========================
// Template: pngTmpl
// =========================


Template.pngTmpl.events({
    'click .js-download-png-logo'(e, tmpl) {
        e.preventDefault();
        let width, height; // var unused
        const pngWidthInput = document.getElementById('png-file-width').value;
        const pngHeightInput = document.getElementById('png-file-height').value;
        const domElem = document.querySelector('#meteor-logo-svg svg');
        const clonedElem = domElem.cloneNode(true);
        
        if (_.isNumber(parseInt(pngHeightInput))) {
            width = clonedElem.setAttribute('width', pngWidthInput);
            height = clonedElem.setAttribute('height', '100%');
        }
        if (_.isNumber(parseInt(pngHeightInput))) {
            width = clonedElem.setAttribute('width', '100%');
            height = clonedElem.setAttribute('height', pngHeightInput);
        }
        if (_.isNumber(parseInt(pngHeightInput)) && _.isNumber(parseInt(pngHeightInput))) {
            width = clonedElem.setAttribute('width', pngWidthInput);
            height = clonedElem.setAttribute('height', pngHeightInput);
        }
        clonedElem.toDataURL('image/png', {
            callback: function (data) {
                saveAs(new Blob([dataURItoBlobData(data)], {type: 'image/png;charset=utf-8'}), 'meteor-logo.png');
                closeModal();
            }
        });
    },
    'keyup [name=png-file-width]'(e) {
        blockLetters(e);
        const input = document.getElementById('png-file-height');
        input.placeholder = 'auto';
        if (e.currentTarget.value === '') {
            input.placeholder = 'Height';
        }
    },
    'keyup [name=png-file-height]'(e) {
        blockLetters(e);
        const input = document.getElementById('png-file-width');
        input.placeholder = 'auto';
        if (e.currentTarget.value === '') {
            input.placeholder = 'Width';
        }
    },
});


// =========================
// Template: svgLogo
// =========================


Template.svgLogo.helpers({
    svgTmpl() {
        return Session.get('activeSVGTemplate') || 'logoSVG';
    },
});
