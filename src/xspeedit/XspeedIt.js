const MAXIMUM_BOXE_CAPACITY = 10;

/**
 * Core robot XspeedIt 
 * @param {string}
 */
class XspeedIt {

    constructor (input) {
        this.boxes = [];
        this.fillBoxes(this.prepareNumbers(input));
    }

    /**
     * boxes getter
     * @returns {Array}
     */
    getBoxes () {
        return this.boxes;
    }
    
    /**
     * fill boxes with items
     * @param {Array<Number>} items 
     * @returns {Array<String>}
     */
    fillBoxes (items) {
        if (!Array.isArray(items)) return false;
        const sortedItems = this.sortReverse(items);
        let boxes = [];

        while (sortedItems.length > 0) {
            let itemValue = sortedItems.shift();
            let searchFail = false;
            this.boxes.push('' + itemValue);
            while (!searchFail && MAXIMUM_BOXE_CAPACITY > itemValue) {
                const nextBetterItemValue = MAXIMUM_BOXE_CAPACITY - itemValue;
                const foundedItem = this.searchItem(nextBetterItemValue, sortedItems);
                if (!foundedItem) {
                    searchFail = true;
                }
                else {
                    this.boxes[this.boxes.length - 1] = '' + this.boxes[this.boxes.length - 1] + foundedItem;
                    itemValue += foundedItem;
                }
            }
        }
        return true;
    }

    /**
     * prepare input to an array : 
     * Remove all char expcept number in 1 to 9 AND
     * build an array with each number
     * @param {String} input
     * @returns {Array<Number>}
     */
    prepareNumbers (input) {
        if (!input || input === '' || typeof input === 'number') return [];
        const inputWithoutZero = input.replace(/([^1-9]+)/g, '');
        return inputWithoutZero.split('').map((number) => parseInt(number));
    }

    /**
     * Ordering array desc
     * @param {Array<Number>} items 
     * @returns {Array<Number>}
     */
    sortReverse (items) {
        if (!Array.isArray(items)) return [];
        return items.sort((a, b) => b - a);
    }

    /**
     * Find a number in array and return him OR
     * recursive try with the decreased number while
     * founded the nearest lower value
     * @param {Number} betterItemValue 
     * @param {Array<Number>} items
     * @returns {Number}
     */
    searchItem (betterItemValue, items) {
        if (typeof betterItemValue !== 'number' || !Array.isArray(items)) return;
        while (0 < betterItemValue) {
            if (~items.indexOf(betterItemValue)) {
                //remove founded value item in items list
                items.splice(items.indexOf(betterItemValue), 1);
                return betterItemValue;
            }
            else {
                //try with decreased value
                return this.searchItem(--betterItemValue, items);
            }
        }
    }
}

module.exports = XspeedIt;
