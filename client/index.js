// =========================
// Tool functions
// =========================

const dataURItoBlobData = function (dataURI) {
    const binary = atob(dataURI.split(',')[1]), array = [];
    for(var i = 0; i < binary.length; i++) array.push(binary.charCodeAt(i));
    return new Uint8Array(array);
};


const getTemplateInstanceByDOM = function (domElemQuetySelector) {
    const blazeView = Blaze.getView(document.querySelector(domElemQuetySelector));
    return blazeView && blazeView.templateInstance();
};

const openModal = function (e, tmpl, modalTemplate) {
    e.preventDefault();
    tmpl.modalTemplate.set(modalTemplate);
    $('html').css('overflow', 'hidden');
    tmpl.modalActive.set(true);
};

const closeModal = function () {
    const tmpl = getTemplateInstanceByDOM('.jumbo');
    $('html').css('overflow', 'auto');
    tmpl.modalActive.set(false);
};

const blockLetters = function (e) {
    const checkKey = (e.keyCode === 46 || e.keyCode === 8 || (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105));
    if (!checkKey) {
        $(e.currentTarget).val('');
    };
};

const changeLogoColor = function (e, tmpl, query) {
    const value = $(e.currentTarget).val();
    if (value && /^#(?:[0-9a-f]{3}){1,2}$/i.test(value)) {
        tmpl.$('.logo-custom svg').find(query).css('fill', value);
    }
}


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
        $('html').css('overflow', 'auto');
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
    }
});
Template.main.helpers({
    isModalActive() {
        const tmpl = Template.instance();
        return tmpl.modalActive.get();
    },
    logoTypeClass() {
        return Session.get('activeSVGTemplate') || 'logoSVG';
    }
});


// =========================
// Template: modal
// =========================


Template.modal.helpers({
    modalTemplate() {
        const mainTmpl = getTemplateInstanceByDOM('.jumbo');
        return mainTmpl.modalTemplate.get() || '';
    }
});


// =========================
// Template: colorTmpl
// =========================


Template.colorTmpl.helpers({
    isOnlyLogo() {
        const typeOfLogo = Session.get('activeSVGTemplate');
        if (typeof typeOfLogo === 'undefined' || typeOfLogo === 'logoSVG') {
            return true;
        }
    }
});

Template.colorPicker.events({
    'change .js-choose-text-color'(e) {
        const parentTemplate = getTemplateInstanceByDOM('.modal-color-template');
        changeLogoColor(e, parentTemplate, 'g:eq(1) path');
    },
    'change .js-choose-logo-color'(e, tmpl) {
        const parentTemplate = getTemplateInstanceByDOM('.modal-color-template');
        changeLogoColor(e, parentTemplate, 'g:eq(0) path');
    }
});

Template.colorTmpl.events({
    'change .js-choose-all-color'(e, tmpl) {
        changeLogoColor(e, tmpl, 'path');
    },
    'click .js-logo-choose-all'(e) {
        const svgPath = $(e.currentTarget).find('svg path');
        const fill = svgPath && svgPath.css('fill');
        let tmpl;
        if (fill) {
            $('#meteor-logo-svg svg').find('path').css('fill', fill);
            closeModal();
        }
    },
    'click .js-logo-text-choose'(e) {
        const svgPathText = $(e.currentTarget).find('svg g:eq(1) path');
        const svgPathLogo = $(e.currentTarget).find('svg g:eq(0) path');
        const fillText = svgPathText && svgPathText.css('fill');
        const fillLogo = svgPathLogo && svgPathLogo.css('fill');
        let tmpl;
        if (fillText && fillLogo) {
            $('#meteor-logo-svg svg').find('g:eq(0) path').css('fill', fillLogo);
            $('#meteor-logo-svg svg').find('g:eq(1) path').css('fill', fillText);
            closeModal();
        }
    }
});


// =========================
// Template: pngTmpl
// =========================


Template.pngTmpl.events({
    'click .js-download-png-logo'(e, tmpl) {
        e.preventDefault();
        let domElem, clonedElem, width, height, pngHeightInput, pngWidthInput, mainTmpl;
        pngWidthInput = $('[name=png-file-width]').val();
        pngHeightInput = $('[name=png-file-height]').val();
        domElem = document.querySelector('#meteor-logo-svg svg');
        clonedElem = domElem.cloneNode(true);
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
        $('[name=png-file-height]').attr('placeholder', 'auto');
        if ($(e.currentTarget).val() === '') {
            $('[name=png-file-height]').attr('placeholder', 'Height');
        }
    },
    'keyup [name=png-file-height]'(e) {
        blockLetters(e);
        $('[name=png-file-width]').attr('placeholder', 'auto');
        if ($(e.currentTarget).val() === '') {
            $('[name=png-file-width]').attr('placeholder', 'Width');
        }
    }
});


// =========================
// Template: svgLogo
// =========================


Template.svgLogo.helpers({
    svgTmpl() {
        return Session.get('activeSVGTemplate') || 'logoSVG';
    }
});