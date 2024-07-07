// ==UserScript==
// @name	DBounce
// @namespace	nat.is-a.dev
// @match	https://neal.fun/infinite-craft/*
// @grant	unsafeWindow
// @run-at	document-end
// @version	1.0
// @author	Natasquare
// @description	Adds input debouncing to the search bar and implements some other optimizations.
// ==/UserScript==

/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Marin Atanasov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const characterMap={"À":"A","Á":"A","Â":"A","Ã":"A","Ä":"A","Å":"A","Ấ":"A","Ắ":"A","Ẳ":"A","Ẵ":"A","Ặ":"A","Æ":"AE","Ầ":"A","Ằ":"A","Ȃ":"A","Ả":"A","Ạ":"A","Ẩ":"A","Ẫ":"A","Ậ":"A","Ç":"C","Ḉ":"C","È":"E","É":"E","Ê":"E","Ë":"E","Ế":"E","Ḗ":"E","Ề":"E","Ḕ":"E","Ḝ":"E","Ȇ":"E","Ẻ":"E","Ẽ":"E","Ẹ":"E","Ể":"E","Ễ":"E","Ệ":"E","Ì":"I","Í":"I","Î":"I","Ï":"I","Ḯ":"I","Ȋ":"I","Ỉ":"I","Ị":"I","Ð":"D","Ñ":"N","Ò":"O","Ó":"O","Ô":"O","Õ":"O","Ö":"O","Ø":"O","Ố":"O","Ṍ":"O","Ṓ":"O","Ȏ":"O","Ỏ":"O","Ọ":"O","Ổ":"O","Ỗ":"O","Ộ":"O","Ờ":"O","Ở":"O","Ỡ":"O","Ớ":"O","Ợ":"O","Ù":"U","Ú":"U","Û":"U","Ü":"U","Ủ":"U","Ụ":"U","Ử":"U","Ữ":"U","Ự":"U","Ý":"Y","à":"a","á":"a","â":"a","ã":"a","ä":"a","å":"a","ấ":"a","ắ":"a","ẳ":"a","ẵ":"a","ặ":"a","æ":"ae","ầ":"a","ằ":"a","ȃ":"a","ả":"a","ạ":"a","ẩ":"a","ẫ":"a","ậ":"a","ç":"c","ḉ":"c","è":"e","é":"e","ê":"e","ë":"e","ế":"e","ḗ":"e","ề":"e","ḕ":"e","ḝ":"e","ȇ":"e","ẻ":"e","ẽ":"e","ẹ":"e","ể":"e","ễ":"e","ệ":"e","ì":"i","í":"i","î":"i","ï":"i","ḯ":"i","ȋ":"i","ỉ":"i","ị":"i","ð":"d","ñ":"n","ò":"o","ó":"o","ô":"o","õ":"o","ö":"o","ø":"o","ố":"o","ṍ":"o","ṓ":"o","ȏ":"o","ỏ":"o","ọ":"o","ổ":"o","ỗ":"o","ộ":"o","ờ":"o","ở":"o","ỡ":"o","ớ":"o","ợ":"o","ù":"u","ú":"u","û":"u","ü":"u","ủ":"u","ụ":"u","ử":"u","ữ":"u","ự":"u","ý":"y","ÿ":"y","Ā":"A","ā":"a","Ă":"A","ă":"a","Ą":"A","ą":"a","Ć":"C","ć":"c","Ĉ":"C","ĉ":"c","Ċ":"C","ċ":"c","Č":"C","č":"c","C̆":"C","c̆":"c","Ď":"D","ď":"d","Đ":"D","đ":"d","Ē":"E","ē":"e","Ĕ":"E","ĕ":"e","Ė":"E","ė":"e","Ę":"E","ę":"e","Ě":"E","ě":"e","Ĝ":"G","Ǵ":"G","ĝ":"g","ǵ":"g","Ğ":"G","ğ":"g","Ġ":"G","ġ":"g","Ģ":"G","ģ":"g","Ĥ":"H","ĥ":"h","Ħ":"H","ħ":"h","Ḫ":"H","ḫ":"h","Ĩ":"I","ĩ":"i","Ī":"I","ī":"i","Ĭ":"I","ĭ":"i","Į":"I","į":"i","İ":"I","ı":"i","Ĳ":"IJ","ĳ":"ij","Ĵ":"J","ĵ":"j","Ķ":"K","ķ":"k","Ḱ":"K","ḱ":"k","K̆":"K","k̆":"k","Ĺ":"L","ĺ":"l","Ļ":"L","ļ":"l","Ľ":"L","ľ":"l","Ŀ":"L","ŀ":"l","Ł":"l","ł":"l","Ḿ":"M","ḿ":"m","M̆":"M","m̆":"m","Ń":"N","ń":"n","Ņ":"N","ņ":"n","Ň":"N","ň":"n","ŉ":"n","N̆":"N","n̆":"n","Ō":"O","ō":"o","Ŏ":"O","ŏ":"o","Ő":"O","ő":"o","Œ":"OE","œ":"oe","P̆":"P","p̆":"p","Ŕ":"R","ŕ":"r","Ŗ":"R","ŗ":"r","Ř":"R","ř":"r","R̆":"R","r̆":"r","Ȓ":"R","ȓ":"r","Ś":"S","ś":"s","Ŝ":"S","ŝ":"s","Ş":"S","Ș":"S","ș":"s","ş":"s","Š":"S","š":"s","Ţ":"T","ţ":"t","ț":"t","Ț":"T","Ť":"T","ť":"t","Ŧ":"T","ŧ":"t","T̆":"T","t̆":"t","Ũ":"U","ũ":"u","Ū":"U","ū":"u","Ŭ":"U","ŭ":"u","Ů":"U","ů":"u","Ű":"U","ű":"u","Ų":"U","ų":"u","Ȗ":"U","ȗ":"u","V̆":"V","v̆":"v","Ŵ":"W","ŵ":"w","Ẃ":"W","ẃ":"w","X̆":"X","x̆":"x","Ŷ":"Y","ŷ":"y","Ÿ":"Y","Y̆":"Y","y̆":"y","Ź":"Z","ź":"z","Ż":"Z","ż":"z","Ž":"Z","ž":"z","ſ":"s","ƒ":"f","Ơ":"O","ơ":"o","Ư":"U","ư":"u","Ǎ":"A","ǎ":"a","Ǐ":"I","ǐ":"i","Ǒ":"O","ǒ":"o","Ǔ":"U","ǔ":"u","Ǖ":"U","ǖ":"u","Ǘ":"U","ǘ":"u","Ǚ":"U","ǚ":"u","Ǜ":"U","ǜ":"u","Ứ":"U","ứ":"u","Ṹ":"U","ṹ":"u","Ǻ":"A","ǻ":"a","Ǽ":"AE","ǽ":"ae","Ǿ":"O","ǿ":"o","Þ":"TH","þ":"th","Ṕ":"P","ṕ":"p","Ṥ":"S","ṥ":"s","X́":"X","x́":"x","Ѓ":"Г","ѓ":"г","Ќ":"К","ќ":"к","A̋":"A","a̋":"a","E̋":"E","e̋":"e","I̋":"I","i̋":"i","Ǹ":"N","ǹ":"n","Ồ":"O","ồ":"o","Ṑ":"O","ṑ":"o","Ừ":"U","ừ":"u","Ẁ":"W","ẁ":"w","Ỳ":"Y","ỳ":"y","Ȁ":"A","ȁ":"a","Ȅ":"E","ȅ":"e","Ȉ":"I","ȉ":"i","Ȍ":"O","ȍ":"o","Ȑ":"R","ȑ":"r","Ȕ":"U","ȕ":"u","B̌":"B","b̌":"b","Č̣":"C","č̣":"c","Ê̌":"E","ê̌":"e","F̌":"F","f̌":"f","Ǧ":"G","ǧ":"g","Ȟ":"H","ȟ":"h","J̌":"J","ǰ":"j","Ǩ":"K","ǩ":"k","M̌":"M","m̌":"m","P̌":"P","p̌":"p","Q̌":"Q","q̌":"q","Ř̩":"R","ř̩":"r","Ṧ":"S","ṧ":"s","V̌":"V","v̌":"v","W̌":"W","w̌":"w","X̌":"X","x̌":"x","Y̌":"Y","y̌":"y","A̧":"A","a̧":"a","B̧":"B","b̧":"b","Ḑ":"D","ḑ":"d","Ȩ":"E","ȩ":"e","Ɛ̧":"E","ɛ̧":"e","Ḩ":"H","ḩ":"h","I̧":"I","i̧":"i","Ɨ̧":"I","ɨ̧":"i","M̧":"M","m̧":"m","O̧":"O","o̧":"o","Q̧":"Q","q̧":"q","U̧":"U","u̧":"u","X̧":"X","x̧":"x","Z̧":"Z","z̧":"z","й":"и","Й":"И","ё":"е","Ё":"Е"},removeAccentsRegex=new RegExp(Object.keys(characterMap).join("|"),"g");function removeAccents(e){return e.replace(removeAccentsRegex,(e=>characterMap[e]))}const rankings={CASE_SENSITIVE_EQUAL:7,EQUAL:6,STARTS_WITH:5,WORD_STARTS_WITH:4,CONTAINS:3,ACRONYM:2,MATCHES:1,NO_MATCH:0},defaultBaseSortFn=(e,n)=>String(e.rankedValue).localeCompare(String(n.rankedValue));function matchSorter(e,n,t={}){const{keys:r,threshold:a=rankings.MATCHES,baseSort:o=defaultBaseSortFn,sorter:s=(e=>e.sort(((e,n)=>sortRankedValues(e,n,o))))}=t;return s(e.reduce((function(e,o,s){const i=getHighestRanking(o,r,n,t),{rank:u,keyThreshold:l=a}=i;u>=l&&e.push({...i,item:o,index:s});return e}),[])).map((({item:e})=>e))}function getHighestRanking(e,n,t,r){if(!n){return{rankedValue:e,rank:getMatchRanking(e,t,r),keyIndex:-1,keyThreshold:r.threshold}}return getAllValuesToRank(e,n).reduce((({rank:e,rankedValue:n,keyIndex:a,keyThreshold:o},{itemValue:s,attributes:i},u)=>{let l=getMatchRanking(s,t,r),c=n;const{minRanking:A,maxRanking:g,threshold:k}=i;return l<A&&l>=rankings.MATCHES?l=A:l>g&&(l=g),l>e&&(e=l,a=u,o=k,c=s),{rankedValue:c,rank:e,keyIndex:a,keyThreshold:o}}),{rankedValue:e,rank:rankings.NO_MATCH,keyIndex:-1,keyThreshold:r.threshold})}function getMatchRanking(e,n,t){return e=prepareValueForComparison(e,t),(n=prepareValueForComparison(n,t)).length>e.length?rankings.NO_MATCH:e===n?rankings.CASE_SENSITIVE_EQUAL:(e=e.toLowerCase())===(n=n.toLowerCase())?rankings.EQUAL:e.startsWith(n)?rankings.STARTS_WITH:e.includes(` ${n}`)?rankings.WORD_STARTS_WITH:e.includes(n)?rankings.CONTAINS:1===n.length?rankings.NO_MATCH:getAcronym(e).includes(n)?rankings.ACRONYM:getClosenessRanking(e,n)}function getAcronym(e){let n="";const t=e.split(" ");for(const e of t){const t=e.split("-");for(const e of t)n+=e.substr(0,1)}return n}function getClosenessRanking(e,n){let t=0,r=0;function a(e,n,r){for(let a=r,o=n.length;a<o;a++){if(n[a]===e)return t+=1,a+1}return-1}const o=a(n[0],e,0);if(o<0)return rankings.NO_MATCH;r=o;for(let t=1,o=n.length;t<o;t++){r=a(n[t],e,r);if(!(r>-1))return rankings.NO_MATCH}return function(e){const r=1/e,a=t/n.length;return rankings.MATCHES+a*r}(r-o)}function sortRankedValues(e,n,t){const{rank:r,keyIndex:a}=e,{rank:o,keyIndex:s}=n;return r===o?a===s?t(e,n):a<s?-1:1:r>o?-1:1}function prepareValueForComparison(e,{keepDiacritics:n}){return e=`${e}`,n||(e=removeAccents(e)),e}function getItemValues(e,n){let t;if("object"==typeof n&&(n=n.key),"function"==typeof n)t=n(e);else if(null==e)t=null;else if(Object.hasOwn(e,n))t=e[n];else{if(n.includes("."))return getNestedValues(n,e);t=null}return null==t?[]:Array.isArray(t)?t:[String(t)]}function getNestedValues(e,n){const t=e.split(".");let r=[n];for(let e=0,n=t.length;e<n;e++){const n=t[e];let a=[];for(let e=0,t=r.length;e<t;e++){const t=r[e];if(null!=t)if(Object.hasOwn(t,n)){const e=t[n];null!=e&&a.push(e)}else"*"===n&&(a=a.concat(t))}r=a}if(Array.isArray(r[0])){return[].concat(...r)}return r}function getAllValuesToRank(e,n){const t=[];for(let r=0,a=n.length;r<a;r++){const a=n[r],o=getKeyAttributes(a),s=getItemValues(e,a);for(let e=0,n=s.length;e<n;e++)t.push({itemValue:s[e],attributes:o})}return t}matchSorter.rankings=rankings;const defaultKeyAttributes={maxRanking:1/0,minRanking:-1/0};function getKeyAttributes(e){return"string"==typeof e?defaultKeyAttributes:{...defaultKeyAttributes,...e}}

(function() {
	const resultLimit = 300,                     // maximum number of results to show when searching. on normal IC it's 200
		delay = 250,                             // delay (in ms) after the last keystroke until it is decided that you've stopped typing
		hideItemsWhenNoQuery = true,             // performance boost, significantly more effective if you use the More Elements script
		sortAfterFilter = false,                 // normally, your elements will get sorted before the searching, this setting will sort them after filtering out results instead
		                                         // this is indeed faster than the default implementation, but custom sort types implemented in other userscripts will break
		lengthSortThreshold = resultLimit * 100; // switch to sorting by length when the result count is over this threshold

	// do not change anything below here, if anything breaks please report in #dev

	let patchedDeps = false;
	function limitDeps() {
		if (patchedDeps) return;
		const addDep = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._computedWatchers.sortedElements.addDep;
		unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._computedWatchers.sortedElements.addDep = exportFunction(function(...a) {
			if (this.newDepIds.size < 10) return addDep.apply(this, a);
		}, unsafeWindow);
		unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._computedWatchers.searchResults.addDep = exportFunction(function(...a) {
			if (this.newDepIds.size < 10) return addDep.apply(this, a);
		}, unsafeWindow);
		patchedDeps = true;
	}

	async function init() {
		const _filteredElements = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._computedWatchers.filteredElements.getter;
		unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._computedWatchers.filteredElements.getter = exportFunction(function(a = true) {
			const filtered = _filteredElements.call(this);
			if (hideItemsWhenNoQuery && (!this.searchQuery || (this.searchQuery && a))) {
				if (!this.searchQuery) unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].$refs.search.placeholder = `Search (${filtered.length}) items...`;
				return [];
			}
			return filtered;
		}, unsafeWindow);

		const _sortedElements = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._computedWatchers.sortedElements.getter;
		unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._computedWatchers.sortedElements.getter = exportFunction(function(a = true) {
			return (sortAfterFilter && this.searchQuery) || (hideItemsWhenNoQuery && !this.searchQuery) ? this.elements : _sortedElements.call(this);
		}, unsafeWindow);

		unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._computedWatchers.searchResults.getter = exportFunction(function() {
			if (!this.searchQuery) return [];
			const t = [],
				o = this.searchQuery.toLowerCase(),
				e = _filteredElements.call(this, false),
				el = e.length;
			if (sortAfterFilter) {
				for (let n = 0; n < el; n++) {
					if (e[n].text.toLowerCase().indexOf(o) > -1) {
						t.push(e[n]);
					}
				}
			} else {
				for (let n = 0, i = 0; n < el && i < resultLimit; n++) {
					if (e[n].text.toLowerCase().indexOf(o) > -1) {
						t.push(e[n]);
						i++;
					}
				}
				return t;
			}
			let sorted = t;
			if (t.length < resultLimit * 100) {
				sorted = matchSorter(t, this.searchQuery, { keys: ["text"] });
			} else {
				sorted = t.sort((a, b) => a.text.length - b.text.length);
			}
			return sorted.slice(0, resultLimit);
		}, unsafeWindow);

		const search = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].$refs.search.cloneNode(true);
		unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].$refs.search.replaceWith(search);
		unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].$refs.search = search;

		let timeout = null;
		search.addEventListener("input", function(e) {
			limitDeps();
			if (!e.target.value) return unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.searchQuery = "";
			if (timeout) clearTimeout(timeout);
			timeout = setTimeout(() => {
				timeout = null;
				unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.searchQuery = e.target.value;
			}, delay);
		});

		window.addEventListener("keydown", (e) => {
			if (document.activeElement !== search)
				search.focus();
		});
	}

	window.addEventListener("load", init, false);
})()