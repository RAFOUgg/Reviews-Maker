/**
 * Types de widgets supportés par une question du wizard, et la valeur "sentinel"
 * écrite quand l'utilisateur clique sur "Information inconnue".
 */
export const WIZARD_WIDGETS = {
    TEXT: 'text',
    TEXTAREA: 'textarea',
    SELECT: 'select',
    CHIPS: 'chips',
    SLIDER: 'slider',
    PHOTO: 'photo',
    HANDOFF: 'handoff-step',
}

export const SENTINEL_BY_WIDGET = {
    [WIZARD_WIDGETS.TEXT]: '',
    [WIZARD_WIDGETS.TEXTAREA]: '',
    [WIZARD_WIDGETS.SELECT]: '',
    [WIZARD_WIDGETS.CHIPS]: [],
    [WIZARD_WIDGETS.SLIDER]: 0,
    [WIZARD_WIDGETS.PHOTO]: undefined,
    [WIZARD_WIDGETS.HANDOFF]: undefined,
}
