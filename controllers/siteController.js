const { selectAll, selectGet, insertSingle } = require("../middleware/query");
const _ = require("lodash");
const {
  getFAQ,
  getLogo,
  getHowTO,
  getVideos,
  getSpeakable,
  getLocalBusiness,
  getService,
  getLinkJuice,
} = require("./seoController");

const {
  getAllServices,
  getServiceNameById,
  getServiceByName,
} = require("./serviceController");
const { fixTrimSpace, makeUrl, myUcFirst } = require("../helpers/helper");

const table_name = "site";

const getTemplate = async (req, res, next) => {
  try {
    let { type, zip, service } = req.query;

    //get default data from site table
    let sql = `SELECT * FROM ${table_name}`;

    const siteData = await selectGet(sql);
    if (!siteData) {
      return res.status(400).json("No records found.");
    }

    let template_req = {};
    template_req.site = siteData;
    template_req.data = {
      type: "home",
      zip: "",
      city: siteData.city,
      state: siteData.state,
      servicePage: "",
      service_id: siteData.service_id,
      custom_keyword: "",
      location: siteData.city,
      phone: siteData.phone,
      county: siteData.county,
      latitude: siteData.latitude,
      longitude: siteData.longitude,
      domain: siteData.domain,
      stateCodeValue: siteData.state_code,
    };

    template_req.data.type = type;

    switch (type) {
      case "zip":
      case "service":
        if (service) {
          template_req.data.custom_keyword = myUcFirst(
            service.replace("-", " ")
          );
          
          let result = await getServiceByName(template_req.data.custom_keyword);
          if (!result) {
            return res
              .status(400)
              .json({ response: "Please check your parameter" });
          }

          template_req.data.service_id = result.id;
        }

        if (zip) {
          if (service) {
            template_req.data.servicePage = 1;
          }
          template_req.data.zip = zip;
          template_req.data.location = zip;
        }
        break;

      case "contact":
        template_req.data.type = type;
        break;

      case "home":
      default:
        template_req.data.type = "home";
        template_req.data.custom_keyword = await getServiceNameById(
          template_req.data.service_id
        );
        break;
    }

    const allServicesList = await getServicesList(template_req);

    const zipcodesList = await getZipCodesList(template_req);
    await getLatLongPhone(template_req);
    // console.log(
    //   "🚀 ~ file: siteController.js:84 ~ getTemplate ~ location_details",
    //   location_details
    // );

    const textBlockAndMetaTagInfomation =
      await getTextBlockAndMetaTagInfomation(template_req);

    const allFAQ = await getFAQ(template_req);
    
    const logo = getLogo(template_req);
    const howToSeo = await getHowTO(template_req);

    const videoSeo = await getVideos(template_req);

    const speakableSeo = await getSpeakable(template_req);

    const localBusinessSeo = await getLocalBusiness(template_req);

    const serviceSeo = await getService(template_req);

    const linkJuice = await getLinkJuice(template_req);

    let keyword_location_url = template_req.data.domain;
    let keywordAnchorTag = "";
    if (template_req.data.type == "zip" && !template_req.data.servicePage) {
      keyword_location_url =
        template_req.data.domain +
        "/" +
        makeUrl(template_req.data.zip) +
        "/" +
        makeUrl(template_req.data.custom_keyword);
      keywordAnchorTag =
        '<a style="color:white;text-decoration:underline" href=' +
        template_req.data.domain +
        "/" +
        makeUrl(template_req.data.custom_keyword) +
        "> our " +
        template_req.data.custom_keyword +
        " Company</a>";
    }
    if (template_req.data.type == "zip") {
      keyword_location_url =
        template_req.data.domain + "/" + makeUrl(template_req.data.zip);
      keywordAnchorTag =
        '<a style="color:white;text-decoration:underline" href=' +
        template_req.data.domain +
        "> our " +
        template_req.data.custom_keyword +
        " company</a>";
    }
    if (template_req.data.type == "service") {
      keyword_location_url =
        template_req.data.domain +
        "/" +
        makeUrl(template_req.data.custom_keyword);
    }

    const searchKey = [
      '"[schemas]"',
      "[meta_heading_h1]",
      "[meta_title]",
      "[meta_description]",
      "[keyword]",
      "[city-state-zipcode]",
      "[phone]",
      "[keyword_location_url]",
      "[current_url]",
      "[latitude]",
      "[longitude]",
      "[text_block_1]",
      "[text_block_2]",
      "[text_block_3]",
      "[text_block_4]",
      "[state]",
      "[county]",
      "[city]",
      '"[zip_codes]"',
      '"[related_services]"',
      "[Breadcrumbs]",
      "[state_code]",
      '"[sitemap_images]"',
      "[type]",
      "[default_service]",
      "[service_name]",
    ];

    let apiResponse = {
      "[schemas]": genSchema([
        allFAQ,
        logo,
        howToSeo,
        videoSeo,
        speakableSeo,
        localBusinessSeo,
        serviceSeo,
        linkJuice,
      ]),
      "[meta_heading_h1]": myUcFirst(
        textBlockAndMetaTagInfomation.meta_heading
      ),
      "[meta_title]": textBlockAndMetaTagInfomation.meta_title,
      "[meta_description]": textBlockAndMetaTagInfomation.meta_description,
      "[keyword]": myUcFirst(template_req.data.custom_keyword),
      "[city-state-zipcode]": myUcFirst(template_req.data.location),
      "[phone]": template_req.data.phone,
      "[keyword_location_url]": keyword_location_url,
      "[current_url]": template_req.data.domain,
      "[latitude]": template_req.data.latitude,
      "[longitude]": template_req.data.longitude,
      "[text_block_1]": textBlockAndMetaTagInfomation.text_block_1,
      "[text_block_2]": textBlockAndMetaTagInfomation.text_block_2,
      "[text_block_3]": textBlockAndMetaTagInfomation.text_block_3,
      "[text_block_4]": textBlockAndMetaTagInfomation.text_block_4,
      "[state]": myUcFirst(template_req.data.state),
      "[county]": myUcFirst(template_req.data.county),
      "[city]": myUcFirst(template_req.data.city),
      "[zip_codes]": zipcodesList,
      "[related_services]": allServicesList,
      "[Breadcrumbs]": keyword_location_url,
      "[state_code]": template_req.data.stateCodeValue,
      "[sitemapImages]": "",
      "[type]": template_req.data.type,
      "[default_service]": myUcFirst(
        await getServiceNameById(template_req.site.id)
      ),
      "[service_name]": myUcFirst(template_req.data.custom_keyword),
    };

    const finalResult = await genResJson(apiResponse, template_req);

    return res.status(200).json(finalResult);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    return res.status(err.statusCode).json({ error: err.message });
  }
};

const genSchema = (schemaList) => {
  let result = [];
  if (!schemaList) {
    return result;
  }

  schemaList.forEach((schema) => {
    if (schema != "") {
      result.push(schema);
    }
  });

  return result;
};

const genResJson = async (apiResponse, template_req) => {
  try {
    const { type } = template_req.data;
    let tableName = "template";
    let jsonResponse;
    let sql = `SELECT * FROM ${tableName} where type = ?`;
    const template = await selectGet(sql, [type]);
    if (template) {
      jsonResponse = template.html;

      for (let [key, value] of Object.entries(apiResponse)) {
        if (value && Array.isArray(value)) {
          value = JSON.stringify(value);
        }

        jsonResponse = jsonResponse.replaceAll(key, value);
      }
    }

    jsonResponse = jsonResponse.replaceAll('"[{', "[{");
    jsonResponse = jsonResponse.replaceAll('}]"', "}]");
    jsonResponse = jsonResponse.replaceAll(/(\r\n|\n|\r)/gm, "");

    return JSON.parse(jsonResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    return { error: err.message };
  }
};

const getServicesList = async (template_req) => {
  try {
    const { type, zip } = template_req.data;
    //fetch all services from db
    let services = await getAllServices();

    //removing "towing" service object from service list
    services = services.filter(function (obj) {
      return obj.service_name.toLowerCase() !== "towing";
    });

    let result = [];
    if (type == "zip") {
      services.forEach((service) => {
        result.push({
          name: service.service_name,
          path: makeUrl(zip) + "/" + makeUrl(service.service_name),
        });
      });
    } else {
      services.forEach((service) => {
        result.push({
          name: service.service_name,
          path: "/" + makeUrl(service.service_name),
        });
      });
    }
    return result;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    return { error: err.message };
  }
};

const getZipCodesList = async (template_req) => {
  const { state, city, servicePage, custom_keyword } = template_req.data;
  let tableName = "location_detail";
  let result = [];
  try {
    let sql = `SELECT DISTINCT zip FROM ${tableName} WHERE state_name = ? AND city = ? ORDER BY zip ASC`;
    let params = [state, city];
    let zipCodes = await selectAll(sql, params);

    if (servicePage) {
      zipCodes.forEach((zipCode) => {
        result.push({
          name: zipCode.zip,
          path: makeUrl(zipCode.zip) + "/" + makeUrl(custom_keyword),
        });
      });
    } else {
      zipCodes.forEach((zipCode) => {
        result.push({ name: zipCode.zip, path: "/" + makeUrl(zipCode.zip) });
      });
    }

    return result;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    return { error: err.message };
  }
};

const getLatLongPhone = async (template_req) => {
  try {
    const { type, zip, state, county, city } = template_req.data;

    let sql;
    switch (type) {
      case "zip":
        sql =
          'SELECT location_detail.zip_latitude as latitude ,location_detail.zip_longitude as longitude,location_detail.areacode,phone.phoneNumber FROM location_detail LEFT JOIN phone ON location_detail.areacode=phone.areacode where location_detail.approved=1 and zip="' +
          zip +
          '" limit 1';
        break;

      case "state":
        sql =
          "SELECT location_detail.state_latitude as latitude,location_detail.state_longitude as longitude,location_detail.areacode,phone.phoneNumber FROM location_detail LEFT JOIN phone ON location_detail.areacode=phone.areacode where location_detail.approved=1 and state_name='" +
          state +
          "' COLLATE NOCASE limit 1";
        break;
      case "county":
        sql =
          "SELECT location_detail.county_latitude as latitude,location_detail.county_longitude as longitude,location_detail.areacode,phone.phoneNumber FROM location_detail LEFT JOIN phone ON location_detail.areacode=phone.areacode where location_detail.approved=1 and state_name='" +
          state +
          "' COLLATE NOCASE and county='" +
          county +
          "' COLLATE NOCASE limit 1";
        break;
      case "city":
        sql =
          "SELECT location_detail.city_latitude as latitude,location_detail.city_longitude as longitude,location_detail.areacode,phone.phoneNumber FROM location_detail LEFT JOIN phone ON location_detail.areacode=phone.areacode where location_detail.approved=1 and state_name='" +
          state +
          "' COLLATE NOCASE and city='" +
          city +
          "' COLLATE NOCASE limit 1";
        break;
    }

    if (sql) {
      let result = await selectGet(sql, []);
      if (result) {
        if (result.latitude) {
          template_req.data.latitude = result.latitude;
        }
        if (result.longitude) {
          template_req.data.longitude = result.longitude;
        }
        if (result.phoneNumber) {
          template_req.data.phone = result.phoneNumber;
        }
      }
    }
    return true;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    return { error: err.message };
  }
};

const getTextBlockAndMetaTagInfomation = async (template_req) => {
  let tableName = "site_content";
  const { location, service_id, type, phone, city, custom_keyword } =
    template_req.data;

  let sql = `SELECT DISTINCT * FROM ${tableName} WHERE location = ? AND service_id = ? AND type = ?`;
  let params = [location, service_id, type];
  let site_content = await selectGet(sql, params);

  if (site_content) {
    let Obj = {
      "[keyword]": myUcFirst(custom_keyword),
      "[phone]": phone,
      "[city-state-zipcode]": myUcFirst(location),
      "[city]": city,
    };

    let metaInfoArray = {
      meta_heading: site_content.meta_heading,
      meta_title: site_content.meta_title,
      meta_description: site_content.meta_description,
      text_block_1: site_content.text_block_1,
      text_block_2: site_content.text_block_2,
      text_block_3: site_content.text_block_3,
      text_block_4: site_content.text_block_4,
    };

    for (const [key, value] of Object.entries(Obj)) {
      for (let [metaInfoKey, metaInfoValue] of Object.entries(metaInfoArray)) {
        metaInfoArray[metaInfoKey] = metaInfoValue.replaceAll(key, value);
      }
    }

    return metaInfoArray;
  } else {
    return insertContentIfNotExist(template_req);
  }
};

const insertContentIfNotExist = async (template_req) => {
  const { service_id, type, location } = template_req.data;

  let customeTags = await getCustomTag(template_req);
  let allMetaTag = await getMetaTag(template_req);
  let textBlocks = await getTextBlock(template_req);

  let Obj = [];
  customeTags.forEach((customeTag) => {
    let custDescList = customeTag.description.split("||");
    let shuffled_array = _.shuffle(custDescList);

    Obj.push({
      tag: customeTag.tag,
      description: shuffled_array[0],
    });
  });

  let meta_title = "";
  let meta_heading_h1 = "";
  let meta_description = "";
  let text_block_1 = "";
  let text_block_2 = "";
  let text_block_3 = "";
  let text_block_4 = "";

  if (allMetaTag) {
    let metaTitleList = allMetaTag.meta_title.split("||");
    let shuffledMetaTitleArray = _.shuffle(metaTitleList);

    let metaHeadingList = allMetaTag.meta_heading.split("||");
    let shuffledMetaHeadingArray = _.shuffle(metaHeadingList);

    let metaDescriptionList = allMetaTag.meta_description.split("||");
    let shuffledMetaDescriptionArray = _.shuffle(metaDescriptionList);

    meta_title = replaceTag(shuffledMetaTitleArray[0], Obj);
    meta_heading_h1 = replaceTag(shuffledMetaHeadingArray[0], Obj);
    meta_description = replaceTag(shuffledMetaDescriptionArray[0], Obj);
  }

  if (textBlocks) {
    let shuffledMTextBlocksArray = _.shuffle(textBlocks);
    text_block_1 = shuffledMTextBlocksArray[0]
      ? replaceTag(shuffledMTextBlocksArray[0].block, Obj)
      : "";
    text_block_2 = shuffledMTextBlocksArray[1]
      ? replaceTag(shuffledMTextBlocksArray[1].block, Obj)
      : "";
    text_block_3 = shuffledMTextBlocksArray[2]
      ? replaceTag(shuffledMTextBlocksArray[2].block, Obj)
      : "";
    text_block_4 = shuffledMTextBlocksArray[3]
      ? replaceTag(shuffledMTextBlocksArray[3].block, Obj)
      : "";
  }

  let params = [
    service_id,
    type,
    fixTrimSpace(location),
    fixTrimSpace(text_block_1),
    fixTrimSpace(text_block_2),
    fixTrimSpace(text_block_3),
    fixTrimSpace(text_block_4),
    fixTrimSpace(meta_heading_h1),
    fixTrimSpace(meta_title),
    fixTrimSpace(meta_description),
  ];

  let sql = `INSERT INTO site_content 
    (service_id, type, location, text_block_1, text_block_2, text_block_3, text_block_4, meta_heading, meta_title, meta_description)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  await insertSingle(sql, params);

  params = [location, service_id, type];

  return getTextBlockAndMetaTagInfomation(template_req);
};

function replaceTag(stringValue = "", Obj = {}) {
  Obj.forEach((tagData) => {
    if (stringValue.includes(tagData.tag)) {
      stringValue = stringValue.replace(tagData.tag, tagData.description);
    }
  });

  return stringValue;
}

const getCustomTag = async (template_req) => {
  let tableName = "custom_tag";
  let result = [];
  let sql = `SELECT tagName, description FROM ${tableName}`;
  const customTags = await selectAll(sql);
  if (customTags) {
    customTags.forEach((customTag) => {
      result.push({
        tag: customTag.tagName,
        description: customTag.description,
      });
    });
  }
  return result;
};

const getMetaTag = async (template_req) => {
  let tableName = "template";
  const { type } = template_req.data;
  let sql = `SELECT meta_title, meta_heading, meta_description FROM ${tableName} WHERE type = ?`;
  let params = [type];
  return await selectGet(sql, params);
};

const getTextBlock = async (template_req) => {
  let tableName = "textblocks";
  let sql = `SELECT * FROM ${tableName}`;
  return await selectAll(sql);
};

module.exports = {
  getTemplate,
};
