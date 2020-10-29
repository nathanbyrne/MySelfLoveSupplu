const https = require("https"), path = require("path");
const express = require("express");
const { request } = require("express");
const router = express.Router();

const api_settings = {
	key: "021b74c9a0db6e2a2ae1521ee80ebd82",
	password: "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",
	version: "2020-10",
	shop: "peexee-corp-dev-store"
}

const auth = Buffer.from(`${api_settings.key}:${api_settings.password}`, "utf-8").toString("base64");
const api_url = `https://${api_settings.shop}.myshopify.com/admin/api/${api_settings.version}/graphql.json`

function query_api(query, callback) {
	let req = https.request(api_url, {method: "POST"}, (res) => {
		let data = "";

		res.on("data", d => data += d)
		res.on("end", () => {
			console.log(data);
			callback(JSON.parse(data))
		})

		res.on("error", (error) => {
			console.log("" + error);
		})
	});

	req.setHeader("Authorization", `Basic ${auth}`);
	req.setHeader("Content-Type", "application/json");
	req.end(JSON.stringify({query: query}))
}

// Shop homepage
router.get("/", (req, res) => {
	res.sendFile("shop.html", {root: path.join(__dirname, "../public")});
})

// Get all products
router.get("/api/products", (req, res) => {
	query_api(`
		query {
			shop {
				products(first: 5) {
					edges {
						node {
							id
							title
							descriptionHtml
							featuredImage {originalSrc}
							variants(first: 1) {
								edges {
									node {
										price
									}
								}
							}
						}
					}
				}
			}
		}
	`, data => {
		let products = [];

		data.data.shop.products.edges.forEach(product => {
			products.push({
				id: product.node.id,
				title: product.node.title,
				desc: product.node.descriptionHtml,
				icon: product.node.featuredImage,
				price: product.node.variants.edges[0].node.price
			})
		});

		res.json(products);
	});
})

// Get indiviual product
router.get("/api/product/:id", (req, res) => {
	query_api(`
		query {
			product(id: "gid://shopify/Product/${req.params.id}") {
				title
				descriptionHtml
				featuredImage {originalSrc}
				variants(first: 1) {
					edges {
						node {
							price
						}
					}
				}
			}
		}
	`, data => {
		let product = {
			id: req.params.id,
			title: data.data.product.title,
			desc: data.data.product.descriptionHtml,
			icon: data.data.product.featuredImage,
			price: data.data.product.variants.edges[0].node.price
		};

		res.json(product);
	});
})

// Update product info
router.post("/api/product/:id", (req, res) => {
	query_api(`
		mutation {
			productUpdate(input: {
				id: "gid://shopify/Product/${req.params.id}"
				title: "${req.body.title}"
				descriptionHtml: "${req.body.desc}"
			}) {
				userErrors {
					field
					message
				}
			}
		}
	`, data => {
		res.json({});
	});
})

// Create product
router.post("/api/create-product", (req, res) => {
	query_api(`
		mutation {
			productCreate(input: {
				title: "${req.body.title}"
				descriptionHtml: "${req.body.desc}"
			}) {
				product {
					id
				}
				userErrors {
					field
					message
				}
			}
		}
	`, data => {
		console.log(data);
		res.json({id: data.data.productCreate.product.id});
	});
})

module.exports = router;