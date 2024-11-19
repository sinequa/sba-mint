self.addEventListener("message", function (event) {
  // Perform some computation or task
  let result = getAllExtracts(event.data);

  // Send the result back to the main script
  self.postMessage(result);
});

self.addEventListener("error", function (error) {
  console.error("Error in worker:", error);
});

function getAllExtracts({ id, extracts, previewData }) {
  // id       : is the id of the record
  // extracts : contains the html of extracts in chronological order
  // data     : contains the preview data of the record

  // when data is undefined, it means that the preview data is not available
  // in this case, we return an empty array of extracts
  if (!previewData) {
    return;
  }

  const type = previewData?.highlightsPerCategory?.["matchingpassages"]?.values.length
    ? "matchingpassages"
    : "extractslocations";

  // extracts contains the html of extracts in chronological order
  // locations contains the list of start positions sorted by score
  const locations =
    previewData.highlightsPerCategory[type]?.values[0]?.locations || [];

  // first extract all the extracts locations
  let extractslocations = locations.map(function (l, relevanceIndex) {
    return {
      startIndex: l.start,
      relevanceIndex,
    };
  });

  // sort them by start index
  extractslocations.sort((a, b) => a.startIndex - b.startIndex);

  // then extract the text of each extract
  extractslocations = extractslocations.map(function (ex, textIndex) {
    return Object.assign(ex, {
      textIndex: textIndex,
      text: extracts[textIndex] || "",
      id: `${type}_${textIndex}`,
    });
  });

  // remove empty extracts
  const _extracts = extractslocations.filter(
    (item) => item.text.trim().length > 0
  );

  // finally sort them by relevance index
  _extracts.sort((a, b) => a.relevanceIndex - b.relevanceIndex);

  // this is from DedicatedWorkerGlobalScope ( because of that we have postMessage and onmessage methods )
  // and it can't see methods of this class
  // @ts-expect-error worker can't see methods of this class
  return ({
    id,
    extracts: _extracts,
  });
}
