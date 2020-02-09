// GTM Cleaner - Takes a GTM Export and cleans it of paused Tags and unused variables / triggers.

import { gtmExport } from './export.js'
import fs from 'fs'

const { tag, trigger, variable } = gtmExport.containerVersion

// varScrape iterates through Tags, Triggers and Variables to pull out all other variables being referenced.
const varScrape = (x) => {
  let container = []
  x.forEach((element) => {
    const flatVar = Object.values(element).flat()
    flatVar.map((el) => {
      let r = recursion(el)
      r !== undefined &&
        r.forEach((s) => {
          // console.log(s)
          !container.includes(s) && container.push(s)
        })
    })
  })
  // console.log('Variables Scraped: ', container.length)
  return container
}

// Loops through / drills down into Tag, Trigger or Variable to check for references of other variables.
const recursion = (el, bucket = bucket || []) => {
  // Here we push any arrays back in for washing until we get a string (and potentially a {{variable}})...
  if (Array.isArray(el)) {
    // Checks if array..
    el.map((x) => {
      recursion(x, bucket)
    })
  } else if (el instanceof Object) {
    // or if Object..
    Object.values(el).map((x) => {
      recursion(x, bucket)
    })
  }

  // Once we're ready to process an individual string, let's regex match for all {{userVariables}}
  if (typeof el === 'string' && el.match(/{{([^}]*)}}/g)) {
    let exportVar = el.match(/{{([^}]*)}}/g).map((match) => {
      let newMatch = match.replace('{{', '').replace('}}', '')

      // If our bucket already includes the variable, there's no need to store it.
      // Lets return just unique variables..

      return !bucket.includes(newMatch) && newMatch
    })

    // ... then fill the bucket with those unique variables.
    bucket.push(exportVar)
  }
  // Finally, once recursion has finished, let's deliver everything.
  if (bucket.length > 0) {
    return bucket.flat()
  }
}

// liveTags: Get all (not paused) tags, and references to variables and push them to varBucket.
let exportTags = tag.filter((tag) => !tag.paused)

// triggerIds : Grab the trigger ids from live tags ...
let triggerIds = exportTags
  .map((element) => {
    let container = []

    element.firingTriggerId.map(firingTrigger => {
      container.push(firingTrigger) 
    })

    element.blockingTriggerId?.map(blockingTrigger => {
      container.push(blockingTrigger) 
    })

    return container

  }).flat()



// ... then grab those Trigger elements from the export. (THERE CAN BE FIRING TRIGGERS AND BLOCKING TRIGGERS)
console.log()
let exportTriggers = trigger.filter((element) => {
  return triggerIds.includes(element.triggerId)

})

// Then we'll grab the variables referenced in those live tags / triggers..
let varsFromTags = varScrape(exportTags)
let varsfromTriggers = varScrape(exportTriggers)

// Now we need to check whether the variables are referencing other variables..
// So let's destructure our existing lists, grab the actual variable elements from gtmExport..
// then put it through varScrape until they're all checked.

let varsFromTagsTriggers = [ ...varsFromTags, ...varsfromTriggers ]
let uniqueVars = [ ...new Set(varsFromTagsTriggers) ] // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set

// This function takes the array of strings and matches them to their real variable entries in gtmExport
const getVarsFromList = (list) => {
  return variable.filter((x) => {
    return list.includes(x.name) && x
  })
}

// Another recursion loop that checks variables for variables. If a variable references another variable, it'll get put through the wash again until we've referenced ALL THE VARIABLES. Starting to get the hang of this one slowly!
const loopVars = (vars, bucket = bucket || []) => {
  let referenced = getVarsFromList(vars)
  let scrape = varScrape(referenced)

  bucket = bucket.concat(scrape)

  if (scrape.length > 0) {
    loopVars(scrape, bucket)
  }
  return bucket
}

let finalVars = loopVars(uniqueVars) // All variables referenced by other variables. Recursion complete!

let exportVars = getVarsFromList([ ...new Set([ ...uniqueVars, ...finalVars ]) ]) // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set

console.log('\n // BEFORE CLEAN')
console.log('Tags: ', tag.length)
console.log('Triggers: ', trigger.length)
console.log('Variables: ', variable.length)
console.log('\n // AFTER CLEAN')
console.log('Live Tags: ', exportTags.length)
console.log('Live Triggers: ', exportTriggers.length)
console.log('Live Variables: ', exportVars.length)

let exportContainer = gtmExport

exportContainer.containerVersion.tag = exportTags
exportContainer.containerVersion.trigger = exportTriggers
exportContainer.containerVersion.variable = exportVars

// exportContainer.containerVersion.container.notes = `GTM Scrubbed. ${tag.length -
//   exportTags.length} tags, ${trigger.length - exportTriggers.length} triggers, and ${variable.length -
//   exportVars.length} variables removed.`
let date = Date.now()
fs.writeFile(`gtmScrub_${date}_.json`, JSON.stringify(exportContainer), (err) => {
  if (err) {
    console.log(err)
  }
  console.log(`gtmScrub_${date}_.json`)
})
