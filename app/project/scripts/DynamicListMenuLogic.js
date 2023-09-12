/*
    Need to pass in presets array of order num and html and handle rearranging here
*/

class DynamicListMenuLogic {
    constructor(htmlIdPrefix, dynamicMenuId, dynamicButtonId, dynamicListContainer, editableButtons, itemsPerPage,
        backButtonId, forwardButtonId) {
        // Setup Custom
        this.presetsArray = null;
        this.dragging = false;
        this.itemsPerPage = itemsPerPage;
        this.dynamicMenuId = dynamicMenuId;
        this.dynamicButtonId = dynamicButtonId;
        this.dynamicListContainer = dynamicListContainer;
        this.editableButtonId = editableButtons;
        this.backButtonId = backButtonId;
        this.forwardButtonId = forwardButtonId;

        // Setup Custom
        this.htmlIdPrefix = htmlIdPrefix;
        this.presetContainerId = this.htmlIdPrefix + '-dynamic-presets';
        this.dynamicButtonClass = '.' + this.htmlIdPrefix + '-list-dynamic';
        this.presetsContainer = document.getElementById(this.htmlIdPrefix + '-dynamic-presets');
        if(!this.presetsContainer) {
            console.error("Could not find container for dynamic presets with id: ", this.presetContainerId);
        }

        // Setup Defaults
        this.currentPage = 1;
        this.activeButton = null;    
        this.pressedButton = null; 
        this.backTimer = null;
        this.forwardTimer = null;
        this.pressTimer = null;
        this.activeButton = null;
        this.dontPerformPress = false;

        // Initialise
        this.createDynamicPresets = this.createDynamicPresets.bind(this);

        // Handle Events
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.performPress = this.performPress.bind(this);
        this.awaitHoldTimer = this.awaitHoldTimer.bind(this);
        this.releaseButton = this.releaseButton.bind(this);
        this.clearHoldTimer = this.clearHoldTimer.bind(this);

        // Bind methods to the instance
        this.trashIconSelected = this.trashIconSelected.bind(this);
        this.mouseLeftHouse = this.mouseLeftHouse.bind(this);

        this.getPresetsForPage = this.getPresetsForPage.bind(this);
        this.sortPresetOrderByIndex = this.sortPresetOrderByIndex.bind(this);
        this.extractNumberFromId = this.extractNumberFromId.bind(this);
        this.presetSelected = this.presetSelected.bind(this);

        this.startDrag = this.startDrag.bind(this);
        this.drag = this.drag.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        this.setActiveDraggingButton = this.setActiveDraggingButton.bind(this);
        this.unsetActiveDraggingButton = this.unsetActiveDraggingButton.bind(this);
        this.moveButtonUp = this.moveButtonUp.bind(this);
        this.moveButtonDown = this.moveButtonDown.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
        this.clickOutsideHandler = this.clickOutsideHandler.bind(this);
        this.changeNavButtonsForDragging = this.changeNavButtonsForDragging.bind(this);
        this.changeNavButtonsForStopDragging = this.changeNavButtonsForStopDragging.bind(this);
        this.clearTimersResetSpin = this.clearTimersResetSpin.bind(this);
        this.reorderListArray = this.reorderListArray.bind(this);
        this.reorderHighlightedBack = this.reorderHighlightedBack.bind(this);
        this.reorderHighlightedForward = this.reorderHighlightedForward.bind(this);
        this.moveBackwardPage = this.moveBackwardPage.bind(this);
        this.moveForwardPage = this.moveForwardPage.bind(this);
        this.currentPageFirstItemIndex = this.currentPageFirstItemIndex.bind(this);

        this.events = {
            listReorder: new Event('presetSelected'),
          };

        window.addEventListener('subpageRearranging', this.releaseButton);
    }

    createDynamicPresets(presetsArray) {
        //console.log("Presets After Sorting: ", presetsArray);
        this.presetsArray = presetsArray;
        const startIndex = this.currentPageFirstItemIndex();
        let presetsForPage = this.getPresetsForPage(startIndex, this.itemsPerPage);
        this.dynamicListContainer.innerHTML = '';
        this.dynamicListContainer.insertAdjacentHTML('beforeend', presetsForPage);
        this.subscribeToEvents();
    }

    subscribeToEvents() {
        this.unsubscribeToEvents();
        const movableButtons = document.querySelectorAll(this.dynamicButtonClass);
        // For each list button add listeners
        movableButtons.forEach(button => {
            // Activate Press Timer
            button.addEventListener('mousedown', this.awaitHoldTimer);
            button.addEventListener('touchstart', this.handleTouchStart);

            // Release and reset
            // TODO - Need to dettache listeners to click buttons on press also anonymous functions very bad
            button.addEventListener('mouseup', this.performPress);
            button.addEventListener('touchend', this.handleTouchEnd);

            const trashIcon = button.querySelector('#delete-icon');
            if(trashIcon){
                trashIcon.addEventListener('click', this.trashIconSelected);
                trashIcon.addEventListener('touchend', this.trashIconSelected);
            }
        });
        
    }

    unsubscribeToEvents() {
        const movableButtons = document.querySelectorAll(this.dynamicButtonClass);
        // For each list button add listeners
        movableButtons.forEach(button => {
            // Activate Press Timer
            button.removeEventListener('mousedown', this.awaitHoldTimer);
            button.removeEventListener('touchstart', this.handleTouchStart);

            // Release and reset
            button.removeEventListener('mouseup', this.performPress);
            button.removeEventListener('touchend', this.handleTouchEnd);

            const trashIcon = button.querySelector('#delete-icon');
            if(trashIcon){
                trashIcon.removeEventListener('click', this.trashIconSelected);
                trashIcon.removeEventListener('touchend', this.trashIconSelected);
            }
        });
    }

    handleTouchStart(event) {
        //console.log("Touch Start...");
        //event.preventDefault();
        event.target.classList.add('touched');
        this.awaitHoldTimer(event);
    }
    
    handleTouchEnd(event) {
        event.preventDefault();
        if(this.pressedButton) {
            this.pressedButton.classList.remove('touched');
        }
        this.performPress(event);
    }

    performPress(event) {
        // console.log("Perform Press...? : ", this.dontPerformPress);
        let button = event.target;
        if(this.activeButton !== button || !this.activeButton.contains(button)){
            this.stopDrag();
            clearTimeout(this.pressTimer);
            // On press, store pressed button and use it to maintain mouse within boundaries
            if (!this.dontPerformPress) {
                this.presetSelected(button);
            }
            // Reset for next click
            this.dontPerformPress = false;
        }
    }

    releaseButton() {
        //console.log("Release Pressed Button...");
        if(this.pressedButton) {
            this.pressedButton.classList.remove('touched');
            
            //this.pressedButton.removeEventListener('mouseleave', this.mouseLeftHouse);
        }
        this.dontPerformPress = true;
        this.clearHoldTimer();
    }

    clearHoldTimer() {
        //console.log("Notified of rearranging suppages...");
        if(this.pressTimer){
            //console.log("Action taken...");
            clearTimeout(this.pressTimer);
        }
    }

    awaitHoldTimer(event){
        this.dontPerformPress = false;
        if(!this.dragging) {
            let button = event.target;
            this.pressedButton = button;
    
            this.pressTimer = setTimeout(() => {          
                this.dontPerformPress = true;
                this.startDrag(button);
            }, 1500);
        }
    }

    currentPageFirstItemIndex() {
        return (this.currentPage - 1) * this.itemsPerPage;
    }

    presetSelected(button){
        //console.log("Button Selected: ", button.id);
        const buttonNumber = this.extractNumberFromId(button.id);
        if (buttonNumber) {
            //console.log("Send event, preset clicked", buttonNumber);
            const event = new CustomEvent('presetSelected', {
                detail: {
                    presetId: buttonNumber
                }
            });
            this.dynamicListContainer.dispatchEvent(event);
        }
    }

    extractNumberFromId(id) {
        const parts = id.split('listButton');
        if (parts.length === 2) {
            return parts[1];
        }
        return null;
    }


    /* ================================== Handle Arrange Presets ================================== */
    /*
        This method sorts the data-order for each button to be equivalent to its index position in the
        presetsArray.
    */
    sortPresetOrderByIndex() {
        //console.log("Presets: ", this.presetsArray);
        this.presetsArray.forEach((button, index) => {
            //console.log("Button: ", button);
            button.order = index + 1;
        });
        // presetsArray.sort((a, b) => a.order - b.order);
    }

    /*
        This method returns the preset html strings for the presets in within the index positions given.
        @param {number} pageOffset - This value indicates that the presets need to drop the first or last value (-1 or +1 respectively)
        @param {number} itemsPerPage - The number of items per page.
        @returns {string} The HTML strings for the presets on the specified page.
    */ 
    getPresetsForPage(startIndex, itemsPerPage) {
        //console.log("Getting HTML for Page ", pageNumber);
        const endIndex = startIndex + itemsPerPage;

        //console.log("Presets: ", this.presetsArray);
        
        // Organise the array based on order
        this.presetsArray = this.presetsArray.sort((a, b) => a.order - b.order);

        // Extract only the HTML strings from presetsDictionary
        const htmlStrings = this.presetsArray
            .slice(startIndex, endIndex)
            .map(preset => preset.html)
            .join('');

        return htmlStrings;
    }

    /* ================================= Handle Arrange Presets End ================================= */
    /*
        This method is used to notify that a preset has been selected for deletion.
    */
    trashIconSelected(event) {
        event.stopPropagation();
        const presetId = event.target.id;
        const presetIdNum = this.extractNumberFromId(presetId);

        sendSignal.sendAnalogSignal(analogJoins.ShadeControlDeletePreset, presetIdNum);
    }

    mouseLeftHouse() {
        this.releaseButton();
    }

    /* ================================== Handle Button Dragging ================================== */
    startDrag(button) { 
        //console.log("Start Dragging...");
        this.dragging = true;
        this.changeNavButtonsForDragging(); 
        if(this.activeButton){
            this.unsetActiveDraggingButton();
        }
        this.setActiveDraggingButton(button);
        document.addEventListener('mousedown',  this.clickOutsideHandler);
        document.addEventListener('touchstart',  this.clickOutsideHandler);
    }

    drag(e) {
        e.preventDefault();
        e.stopPropagation(); 
        if (this.activeButton) {
            const isTouchEvent = e.type === 'touchmove';
            const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
            const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;
            this.handleDrag(e);
        }
    }

    setActiveDraggingButton(button){
        const iconArea = button.querySelector(this.editableButtonId);
        if(iconArea){
            iconArea.style.display = 'flex';
        }
        button.draggable = true;
        button.classList.add('highlighted', 'wiggle');          
        this.activeButton = button;

        button.addEventListener('touchmove', this.drag);
        button.addEventListener('drag', this.drag);
    }

    unsetActiveDraggingButton(){
        if(this.activeButton){
            const iconArea = this.activeButton.querySelector(this.editableButtonId);
            if(iconArea){
                iconArea.style.display = 'none';
            }
            this.activeButton.draggable = false;
            this.activeButton.classList.remove('highlighted', 'wiggle');
    
            // Detach drag event listeners...
            this.activeButton.removeEventListener('touchmove', this.drag);
            this.activeButton.removeEventListener('drag', this.drag);
            this.activeButton = null;
        }
    }    

    handleDrag(e) {
        const isTouchEvent = e.type === 'touchmove';
        const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
        const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;
    
        const targetButton = document.elementFromPoint(clientX, clientY);
        const dynamicMenu = document.getElementById(this.dynamicMenuId);
    
        if (targetButton && dynamicMenu && dynamicMenu.contains(targetButton)) {    
            if (targetButton.classList.contains('list-button') && targetButton !== this.activeButton) {
                // Clear back and forward timer                
                this.clearTimersResetSpin();       

                const targetRect = targetButton.getBoundingClientRect();
                const targetY = isTouchEvent ? targetRect.top + window.scrollY : targetRect.top;
                const threshold = targetY + targetRect.height / 4; // Adjust the threshold as needed
    
                if (clientY < threshold) {
                    this.moveButtonUp(targetButton);
                } else {
                    this.moveButtonDown(targetButton);
                }
            } else {
                this.clearTimersResetSpin();
            }
        } else {
            if (targetButton.id === this.backButtonId) {
                if (this.forwardTimer) {
                    this.forwardTimer = null;     
                }     
                if (!this.backTimer) {
                    // Start a new timer when the button is dragged over the back button
                    this.backTimer = setTimeout(() => {
                        if (this.backTimer) {
                            clearTimeout(this.backTimer);
                            // Trigger Move Back List
                            this.reorderHighlightedBack();
                        }
                    }, 1000);
                }
            } else if (targetButton.id === this.forwardButtonId) {
                if (this.backTimer) {
                    this.backTimer = null;     
                }                           
                if (!this.forwardTimer) {
                    // Start a new timer when the button is dragged over the forward button
                    this.forwardTimer = setTimeout(() => {
                        if (this.forwardTimer) {
                            clearTimeout(this.forwardTimer);
                            // Trigger Move Forward List
                            this.reorderHighlightedForward();
                        }
                    }, 1000);
                }
            }
        }
    }

    moveButtonUp(targetButton) {
        this.activeButton.parentNode.insertBefore(this.activeButton, targetButton);
    }
    
    moveButtonDown(targetButton) {  
        if (targetButton.nextSibling) {
            targetButton.parentNode.insertBefore(this.activeButton, targetButton.nextSibling);
        } else {
            targetButton.parentNode.appendChild(this.activeButton);
        }
    }

    clearTimersResetSpin(){
        if (this.forwardTimer) {
            this.forwardTimer = null;     
        }   
        if (this.backTimer) {
            this.backTimer = null;     
        }   
    }    
    
    changeNavButtonsForDragging() {
        //console.log("Changing Nav Buttons");
        const backButton = document.getElementById(this.backButtonId);
        const forwardButton = document.getElementById(this.forwardButtonId);

        const backButtonChildDiv = backButton.querySelector('.menu-button-text');
        backButtonChildDiv.textContent = 'Drag Here';

        const forwardButtonChildDiv = forwardButton.querySelector('.menu-button-text');
        forwardButtonChildDiv.textContent = 'Drag Here';
    }

    changeNavButtonsForStopDragging() {
        const backButton = document.getElementById(this.backButtonId);
        const forwardButton = document.getElementById(this.forwardButtonId);
        const backButtonChildDiv = backButton.querySelector('.menu-button-text');
        backButtonChildDiv.textContent = '';

        const forwardButtonChildDiv = forwardButton.querySelector('.menu-button-text');
        forwardButtonChildDiv.textContent = '';
    }

    stopDrag() {
        this.dragging = false;
        if (this.activeButton !== null) {
            const lastActiveButtonId = this.activeButton.id;
            //console.log("Last Active button id ", lastActiveButtonId);
            this.reorderListArray(lastActiveButtonId);
            this.changeNavButtonsForStopDragging();
            this.unsetActiveDraggingButton(this.editableButtonId);
            
            //save orders to preset array?
            
            this.sortPresetOrderByIndex();
            this.createDynamicPresets(this.presetsArray);
            //console.log("Detaching event listeners...")
            document.removeEventListener('mousedown',  this.clickOutsideHandler);
            document.removeEventListener('touchstart',  this.clickOutsideHandler);
        }
    }

    /* ================================= Handle Button Dragging End ================================= */


    reorderListArray(lastActiveButtonId) {
        const lastActiveButtonListIndex = this.presetsArray.findIndex(preset => preset.id === lastActiveButtonId);
        //console.log("Active Buttons Last Index Position: ", lastActiveButtonListIndex);

        const movableButtons = document.querySelectorAll(this.dynamicButtonId);
        let insertIndex = -1; // Target Index I wish to insert item at
    
        movableButtons.forEach((button, index) => {
            //console.log("Button Id ", button.id, " index ", index);
            let currentButtonPresetIndex = this.presetsArray.findIndex(preset => preset.id === button.id);
    
            if (button.id === lastActiveButtonId) {
                //console.log("Matched ", index);
                insertIndex = this.currentPageFirstItemIndex() + index;
                if(insertIndex === currentButtonPresetIndex) {
                    // Do nothing button hasn't moved
                    insertIndex = -1;
                }
            }
        });
    
        // If insert index is -1, do nothing. Otherwise reposition
        if (insertIndex !== -1) {
            // Get the old active button
            //console.log("Insert Index:  ", insertIndex);
            let lastActiveButton = this.presetsArray.find(preset => preset.id === lastActiveButtonId);

            if (lastActiveButtonListIndex !== undefined) {
                //console.log("Remove");
                this.presetsArray.splice(lastActiveButtonListIndex, 1);
                //console.log("Removed", this.presetsArray);
                this.presetsArray.splice(insertIndex, 0, lastActiveButton);
            }
        }

    }

    clickOutsideHandler(e, button) {
        if (this.activeButton && !this.activeButton.contains(e.target)) {
            this.stopDrag(button);
        }
    }

    onPresetSelected(event, callback) {
        this.dynamicListContainer.addEventListener(event, callback);
      }

    moveBackwardPage() {
        if(this.currentPage > 1) {
            this.currentPage--;
        }
        this.createDynamicPresets(this.presetsArray);
    }

    moveForwardPage() {
        const maxPage = Math.ceil(this.presetsArray.length / this.itemsPerPage);
        // console.log("Max Page: ", maxPage, " Page Number: ", this.currentPage);
        if (this.currentPage < maxPage) {
            this.currentPage++;
        }
        this.createDynamicPresets(this.presetsArray);
    }

    /*
        This will trigger when a button is dragged to the specified area which enables reordering the item to the previous page.
    */
    reorderHighlightedBack(){
        this.moveBackwardPage();
        const startIndex = this.currentPageFirstItemIndex();
        let presetsForPage = this.getPresetsForPage(startIndex, 4); // Including the highlighted to create 5
        this.dynamicListContainer.innerHTML = '';
        this.dynamicListContainer.insertAdjacentHTML('beforeend', presetsForPage);
    }

    /*
        This will trigger when a button is dragged to the specified area which enables reordering the item to the next page.        
    */
    reorderHighlightedForward() {
        this.moveForwardPage();
        const startIndex = this.currentPageFirstItemIndex();
        let presetsForPage = this.getPresetsForPage(startIndex + 1, 4); // Including the highlighted to create 5
        this.dynamicListContainer.innerHTML = '';
        this.dynamicListContainer.insertAdjacentHTML('beforeend', presetsForPage);
    }
}