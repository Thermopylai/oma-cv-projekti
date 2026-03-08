/*!
 * Color mode toggler for Bootstrap's docs (https://getbootstrap.com/)
 * Copyright 2011-2025 The Bootstrap Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 */
//Modified by LT, 2026, to fit custom dropdown toggler
//Added checkmark to active theme button and suppport for auto mode icon
//Removed svg icons, now using Bootstrap icons instead

(() => {
    'use strict'

    //Local storage functions
    const getStoredTheme = () => localStorage.getItem('theme')
    const setStoredTheme = theme => localStorage.setItem('theme', theme)
        
    //Get preferred theme
    const getPreferredTheme = () => {
        const storedTheme = getStoredTheme()
        if (storedTheme) {
            return storedTheme
        }
        //If no theme is stored, use the system preference
        //and store it as 'auto'
        setStoredTheme('auto')
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    //Set theme function
    const setTheme = theme => {
        if (theme === 'auto') {
            document.documentElement.setAttribute('data-bs-theme', (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
        } else {
            document.documentElement.setAttribute('data-bs-theme', theme)
        }
    }

    //Initialize theme on page load
    setTheme(getPreferredTheme())

    //Dropdown theme switcher logic
    const showActiveTheme = (theme, focus = false) => {
        const themeSwitcher = document.querySelector('#bd-theme')

        //Do nothing if no theme switcher found or if the switcher is in auto mode
        if (!themeSwitcher) {
            return
        }

        //Elements
        const themeSwitcherText = document.querySelector('#bd-theme-text')
        const activeThemeIcon = document.querySelector('#theme-icon-active')
        const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`)
        const svgOfActiveBtn = btnToActive.querySelector('#theme-icon').getAttribute('class')
        
        document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
            element.classList.remove('active')
            element.setAttribute('aria-pressed', 'false')
        })

        //Hide all checkmarks, making sure only one is visible
        //after selecting a theme
        document.querySelectorAll('#is-checked').forEach(element => {
            if (!element.classList.contains('d-none')) {
                element.classList.add('d-none')
            }
        })

        //Checkmark to active button
        const chkOfActiveBtn = btnToActive.querySelector('#is-checked')
        //Unhide checkmark
        chkOfActiveBtn.classList.remove('d-none')
        
        btnToActive.classList.add('active')
        btnToActive.setAttribute('aria-pressed', 'true')
        //Change icon of active theme button in the toggler
        activeThemeIcon.setAttribute('class', svgOfActiveBtn)
        //Create updated aria-label for theme switcher button
        const themeSwitcherLabel = `${themeSwitcherText.textContent} (${btnToActive.dataset.bsThemeValue})`
        //Update the aria-label of theme switcher button
        themeSwitcher.setAttribute('aria-label', themeSwitcherLabel)
        
        if (focus) {
            themeSwitcher.focus()
        }
    }

    //Listen to system theme changes
    //and change theme if no preference is stored
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const storedTheme = getStoredTheme()
        if (storedTheme !== 'light' && storedTheme !== 'dark') {
            setTheme(getPreferredTheme())
        }
    })

    //On page load or when DOM is ready
    //set the active theme icon in the switcher
    //and add event listeners to each button in the theme switcher
    //Use DOMContentLoaded to ensure elements are loaded before manipulating them
    window.addEventListener('DOMContentLoaded', () => {
        showActiveTheme(getPreferredTheme())
        //Activate event listeners on each button in the theme switcher
        document.querySelectorAll('[data-bs-theme-value]')
            .forEach(toggle => {
                //When a button is clicked
                //set the theme, store the preference
                //and update the active theme icon in the switcher
                toggle.addEventListener('click', () => {
                    const theme = toggle.getAttribute('data-bs-theme-value')
                    setStoredTheme(theme)
                    setTheme(theme)
                    showActiveTheme(theme, true)
                })
            })
    })
})()