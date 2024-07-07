// ==UserScript==
// @name         Hydrogen
// @namespace    N/A
// @version      1.0.0
// @description  A humble client-sided modification for Infinite Craft.
// @author       LofiHD
// @match        https://neal.fun/infinite-craft/*
// @icon         https://i.imgur.com/MKWwBdg.png
// @grant        none
// ==/UserScript==

class Toast
{
    constructor(defaultTimeoutMiliseconds)
    {
        this.timeout = defaultTimeoutMiliseconds
        const _style = `

        #toast
        {
            left: 0px;
            top: 20px;
            right: 0px;
            width: 100%;
            z-index: 20;
            height: 100%;
            color: white;
            padding: 15px;
            font-size: 18px;
            max-width: 450px;
            max-height: 60px;
            margin-left: auto;
            visibility: hidden;
            margin-right: auto;
            position: absolute;
            border-radius: 16px;
            text-align: center left;
            border: 2px solid #1F79FF;
            backdrop-filter: blur(6px);
            background: rgba(38, 125, 255, 0.5);
            box-shadow: 0px 0px 64px 4px rgba(0,0,0,0.75);
            -moz-box-shadow: 0px 0px 64px 4px rgba(0,0,0,0.75);
            -webkit-box-shadow: 0px 0px 64px 4px rgba(0,0,0,0.75);
            text-shadow: 0px 0px 12px rgba(0, 0, 0, 1), 0px 0px 6px rgba(0, 0, 0, 0.75);
        }

        #toast.show
        {
            visibility: visible;
            animation: fadein 0.5s, fadeout 0.5s 2.5s forwards;
            -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s forwards;
        }

        @keyframes fadein
        {
            from
            {
                transform: translateY(20px);
                opacity: 0%;
            }

            to
            {
                transform: translateY(0px);
                opacity: 100%;
            }
        }

        @keyframes fadeout
        {
            from
            {
                transform: translateY(0px);
                opacity: 100%;
            }

            to
            {
                transform: translateY(20px);
                opacity: 0%;
            }
        }

        #toast.success
        {
            border: 2px solid #01E17B;
            background: rgba(0, 237, 81, 0.5);
        }

        #toast.error
        {
            border: 2px solid #F04349;
            background: rgba(240, 66, 72, 0.5);
        }

        #toast.warning
        {
            border: 2px solid #FFD21F;
            background: rgba(255, 212, 38, 0.5);
        }

        @keyframes background-pan
        {
            from
            {
                background-position: 0% center;
            }

            to
            {
                background-position: -200% center;
            }
        }

        #toast.top
        {
            top: 20px;
            bottom: auto;
        }

        #toast.bottom
        {
            top: auto;
            bottom: 20px;
        }

        #toast.right
        {
            left: auto;
            right: 40px;
        }

        #toast.left
        {
            left: 20px;
            right: auto;
        }

        `

        document.head.insertAdjacentHTML('beforeend', `<style>${_style}</style>`)
        document.body.insertAdjacentHTML('beforeend', `<div id='toast'></div>`)
    }

    pop(toastMessage, toastPosition, toastType)
    {
        setTimeout(() => {
            const toast = document.getElementById('toast')
            const toastClassName = ` show ${toastPosition} ${toastType}`

            toast.innerHTML = toastMessage
            toast.className += toastClassName

            setTimeout(() => {toast.className = toast.className.replace(toastClassName, '')}, this.timeout)
        }, 200)
    }
}

const ToastLibrary = new Toast(3000)

const themes = {
    DefaultDark: `

        body
        {
            overflow: hidden !important;
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
        }

        .container
        {
            background-color: #13181D !important;
        }

        .items
        {
            background-color: #070C10 !important;
            align-items: center !important;
            display: ruby-text !important;
        }

        body::webkit-scrollbar
        {
            display: none !important;
        }

        .reset
        {
            color: white !important;
        }

        .item
        {
            background: #070C10 !important;
            border-radius: 12px !important;
            -webkit-box-shadow: 0px 0px 48px 6px rgba(0,0,0,0.75) !important;
            -moz-box-shadow: 0px 0px 48px 6px rgba(0,0,0,0.75) !important;
            box-shadow: 0px 0px 48px 6px rgba(0,0,0,0.75) !important;
            color: white !important;
            transition: border-radius 400ms ease-in-out, background 400ms ease-in-out, scale 200ms ease-in-out, backdrop-filter 400ms ease-in-out !important;
        }

        .item-discovered
        {
            background: #070C10 !important;
            border: 2px solid #3B2861 !important;
            border-radius: 12px !important;
            -webkit-box-shadow: 0px 0px 64px 4px rgba(54,37,87,1) !important;
            -moz-box-shadow: 0px 0px 64px 4px rgba(54,37,87,1) !important;
            box-shadow: 0px 0px 64px 4px rgba(54,37,87,1) !important;
            color: white !important;
            transition: border-radius 400ms ease-in-out, background 400ms ease-in-out, scale 200ms ease-in-out, backdrop-filter 400ms ease-in-out !important;
        }

        .item:has(.instance-discovered-text)
        {
            background: #070C10 !important;
            border: 2px solid #3B2861 !important;
            border-radius: 12px !important;
            -webkit-box-shadow: 0px 0px 64px 4px rgba(54,37,87,1) !important;
            -moz-box-shadow: 0px 0px 64px 4px rgba(54,37,87,1) !important;
            box-shadow: 0px 0px 64px 4px rgba(54,37,87,1) !important;
            color: white !important;
            transition: border-radius 400ms ease-in-out, background 400ms ease-in-out, scale 200ms ease-in-out, backdrop-filter 400ms ease-in-out !important;
        }

        .item:hover
        {
            background: rgba(17, 31, 44, .5) !important;
            backdrop-filter: blur(8px) !important;
            border-radius: 16px !important;
            scale: 1.05 1.05 !important;
        }

        .sidebar-sorting-item
        {
            color: white !important;
            background: #020508 !important;
            -webkit-box-shadow: 0px 0px 48px 6px rgba(0,0,0,0.75) !important;
            -moz-box-shadow: 0px 0px 48px 6px rgba(0,0,0,0.75) !important;
            box-shadow: 0px 0px 48px 6px rgba(0,0,0,0.75) !important;
        }

        .sidebar-input-close
        {
            filter: invert(1) !important;
        }

        .sidebar-input
        {
            background-color: #020508 !important;
            color: white !important;
            -webkit-box-shadow: 0px 0px 48px 6px rgba(0,0,0,0.75) !important;
            -moz-box-shadow: 0px 0px 48px 6px rgba(0,0,0,0.75) !important;
            box-shadow: 0px 0px 48px 6px rgba(0,0,0,0.75) !important;
        }

        .sidebar-input-close
        {
            filter: invert(1) !important;
            visibility: hidden !important;
        }

        .sidebar-input::after
        {
            visibility: hidden !important;
        }

        .empty-sidebar-icon
        {
            filter: invert(1) !important;
        }

        .empty-sidebar
        {
            color: white !important;
        }

        .instance-discovered-text
        {
            -webkit-animation: background-pan 3s linear infinite !important;
            animation: background-pan 3s linear infinite !important;
            background: linear-gradient(
                to right,
                purple,
                violet,
                pink,
                purple
            ) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            white-space: nowrap !important;
            z-index: 200;
            font-weight: bold !important;
            font-size: 16px !important;
            width: 200px !important;
            background-size: 200% !important;
        }

        .instance-discovered-emoji
        {
            filter: brightness(0) invert(1) sepia(1) hue-rotate(200deg) saturate(10000%) grayscale(0) contrast(1) !important;
        }

        .sidebar-sorting-icon
        {
            filter: invert(1) !important;
        }

        .instruction-icon
        {
            filter: invert(1) !important;
        }

        .instruction
        {
            color: white !important;
        }

        .particles,
        .logo,
        .clear,
        .sound,
        .site-title,
        .coffee
        {
            filter: invert(1) !important;
        }

        .sidebar
        {
            border-left: 1px solid #344350 !important;
            -webkit-box-shadow: 0px 0px 48px 6px rgba(0,0,0,0.75) !important;
            -moz-box-shadow: 0px 0px 48px 6px rgba(0,0,0,0.75) !important;
            box-shadow: 0px 0px 48px 6px rgba(0,0,0,0.75) !important;
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
        }

        .settings-content
        {
            background: #020508 !important;
            color: white !important;
            -webkit-box-shadow: 0px 0px 48px 6px rgba(0,0,0,0.75) !important;
            -moz-box-shadow: 0px 0px 48px 6px rgba(0,0,0,0.75) !important;
            box-shadow: 0px 0px 48px 6px rgba(0,0,0,0.75) !important;
            z-index: 200 !important;
            width: 184px !important;
        }

        .setting
        {
            z-index: 200 !important;
            text-align: left !important;
            display: block !important;
        }

        .setting > img
        {
            position: absolute !important;
            right: 16px !important;
        }

        .sidebar-controls::after
        {
            background: linear-gradient(180deg,hsla(0,0%,100%,0), hsla(234, 96%, 11%, 0.125)) !important;
        }

        .sidebar-header
        {
            background: #020508 !important;
            color: white !important;
            -webkit-box-shadow: 0px 0px 48px 6px rgba(0,0,0,0.75) !important;
            -moz-box-shadow: 0px 0px 48px 6px rgba(0,0,0,0.75) !important;
            box-shadow: 0px 0px 48px 6px rgba(0,0,0,0.75) !important;
        }

        .sidebar::webkit-scrollbar
        {
            display: none !important;
        }

    `,
}

class ThemeManager
{
    constructor()
    {
        this.currentTheme = themes.DefaultDark
        this.themeChangeAnimation = `

            .particles,
            .logo,
            .clear,
            .sound,
            .site-title,
            .coffee,
            .container,
            .items,
            .sidebar-input,
            .sidebar,
            .sidebar-sorting-item,
            .reset,
            .instruction,
            .sidebar-input-close
            {
                transition: all 400ms ease-in-out;
            }

            :root
            {
                transition: all 400ms ease-in-out;
            }

            .item
            {
                transition: border-radius 400ms ease-in-out,
                background 400ms ease-in-out,
                color 400ms ease-in-out;
            }

        `

        document.head.insertAdjacentHTML('beforeend', `<style>${this.themeChangeAnimation}</style>`)
    }

    change(themeId)
    {
        const theme = themes[themeId]
        if (!theme)
        {
            ToastLibrary.pop(`Attempt to apply invalid theme '${themeId}'.`, 'top right', 'error')
            return
        }

        document.head.insertAdjacentHTML('beforeend', `<style>${theme}</style>`)

        ToastLibrary.pop(`Theme '${themeId}' applied.`, 'top right', 'success')
    }
}

const Theme = new ThemeManager

setTimeout(() => {Theme.change('DefaultDark')}, 200)