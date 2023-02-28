// Options for the observer (which mutations to observe)
const config = { attributes: false, childList: true, subtree: true };
// String.prototype.hashCode = function () {
//     var hash = 0,
//         i, chr;
//     if (this.length === 0) return hash;
//     for (i = 0; i < this.length; i++) {
//         chr = this.charCodeAt(i);
//         hash = ((hash << 5) - hash) + chr;
//         hash |= 0; // Convert to 32bit integer
//     }
//     return hash;
// }
var textNodes = document.querySelectorAll("[data-ad-comet-preview]");
textNodes.forEach(async (v) => {
    var res = await query({ "inputs": v.textContent });
    v.setAttribute("data-toggle", "tooltip");
    v.setAttribute("title", tooltipText(res));
    counter(res);
});

var textNodes2 = document.querySelectorAll('[style*="background-color: rgb"]');
textNodes2.forEach(async (v) => {
    var res = await query({ "inputs": v.textContent });
    v.setAttribute("data-toggle", "tooltip");
    v.setAttribute("title", tooltipText(res));
    counter(res);
});

var btn = document.createElement("button");
btn.classList.add("btn", "btn-primary");
btn.setAttribute('type', "button");
btn.setAttribute('data-bs-toggle', "offcanvas");
btn.setAttribute('id', "stats-btn");
btn.setAttribute('data-bs-target', "#offcanvasExample");
btn.setAttribute('aria-controls', "offcanvasExample");
btn.style = "position: fixed; top: 50%; left: 0px; transform: translateY(-50%); "
btn.innerHTML = "stats";
document.body.append(btn);

var div = document.createElement("div");
div.classList.add("offcanvas", "offcanvas-start");
div.setAttribute('tabindex', "-1");
div.setAttribute('id', "offcanvasExample");
div.setAttribute('aria-labelledby', "offcanvasExampleLabel");
div.innerHTML = `
<div class="offcanvas-header">
    <h5 class="offcanvas-title" id="offcanvasExampleLabel">Stats</h5>
    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  </div>
  <div class="offcanvas-body">
   
  </div>
`;
document.body.append(div);
$('body').on('click', '#stats-btn', function (e) {
    $(".offcanvas-body").html("total posts: "+ count+"<br>"
    +"positive: "+parseInt(scores["positive"]/count * 100) + "%<br>"
    +"neutral: "+parseInt(scores["neutral"]/count * 100) + "%<br>"
    +"negative: "+parseInt(scores["negative"]/count * 100) + "%<br>")
});
// Callback function to execute when mutations are observed
const callback = async (mutationList, observer) => {
    for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
            for (const node of mutation.addedNodes) {
                if (node instanceof HTMLElement && node.querySelector("[aria-describedby]")) {
                    var textNodes3 = node.querySelectorAll("[data-ad-comet-preview]");
                    var text = textNodes3.length ? [...textNodes3].map(v => v.textContent).join(' ') : "";
                    if (text == "") {
                        textNodes3 = node.querySelector('[style*="background-color: rgb"]');
                        text = textNodes3 ? textNodes3.textContent : "";
                    } else {
                        textNodes3 = textNodes3[0];
                    }
                    if (textNodes3 == null) continue;
                    //var linkNode = node.querySelector('[role="link"]:has(use)');
                    var res = await query({ "inputs": text });
                    textNodes3.setAttribute("data-toggle", "tooltip");
                    textNodes3.setAttribute("title", tooltipText(res));
                    counter(res);
                }

            }

        }
    }
};

function tooltipText(res) {
    var title = res[0][0]["label"] + ": " + parseInt(res[0][0]["score"] * 100) + "%, ";
    title += res[0][1]["label"] + ": " + parseInt(res[0][1]["score"] * 100) + "%, ";
    title += res[0][2]["label"] + ": " + parseInt(res[0][2]["score"] * 100) + "%";
    return title;
}
var count = 0;
var scores = { "positive": 0, "neutral": 0, "negative": 0 };
function counter(res) {
    count++;
    res[0].forEach(v => {
        scores[v["label"]] += v["score"];
    })
}
// $('body').on('mouseover', '.tooltip', function(e) {
//     $(e.target)
// });
// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(document.body, config);

// async function setValue(key, value) {
//     return new Promise(resolve => {
//         chrome.storage.local.set({ [key]: value }).then(() => {
//             resolve(value);
//         });
//     })
// }
// async function getValue(key) {
//     return new Promise(resolve => {
//         chrome.storage.local.get([key]).then((result) => {
//             resolve(result.key);
//         });
//     })
// }

async function query(data) {
    return new Promise(async (resolve) => {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/cardiffnlp/twitter-xlm-roberta-base-sentiment",
            {
                headers: { Authorization: "Bearer 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" },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        const result = await response.json();
        resolve(result);
    })
}

