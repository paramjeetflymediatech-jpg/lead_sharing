import { NextResponse } from 'next/server';

export async function GET(request) {
    const url = new URL(request.url);
    const origin = process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`;

    const openapiSpec = {
        openapi: "3.1.0",
        info: {
            title: "Leadsharing AI Gateway API",
            description: "Autonomous Management API for Leadsharing SEO, Blogs, Services, Categories, and Local Service Pages for ChatGPT Custom GPT Actions.",
            version: "1.0.0"
        },
        servers: [
            {
                url: `${origin}/api/ai-gateway`,
                description: "Leadsharing AI Gateway Server"
            }
        ],
        security: [
            {
                bearerAuth: []
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT/Token",
                    description: "Enter your AI_GATEWAY_SECRET_KEY as the Bearer token."
                }
            },
            schemas: {
                SeoSetting: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        pageName: { type: "string", description: "Path or identifier of the page (e.g. '/' or '/local-tradespeople/toronto')", example: "/local-tradespeople/toronto" },
                        title: { type: "string", example: "Top Rated Commercial Movers in Toronto | Leadsharing" },
                        metaDescription: { type: "string", example: "Looking for top-rated Commercial Movers in Toronto? Connect with vetted local pros today." },
                        keywords: { type: "string", example: "Commercial Movers Toronto, office moving Toronto" },
                        metaRobots: { type: "string", example: "index, follow" },
                        ogTitle: { type: "string", example: "Commercial Movers in Toronto" },
                        ogDescription: { type: "string", example: "Professional corporate and office relocation services in Toronto." },
                        ogImage: { type: "string", example: "https://example.com/og-image.jpg" },
                        canonicalUrl: { type: "string", example: "https://allcarepros.ca/local-tradespeople/commercial-movers-in-toronto" },
                        schemaMarkup: { type: "string", description: "JSON-LD structured data string" }
                    },
                    required: ["pageName", "title"]
                },
                Blog: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        title: { type: "string", example: "10 Essential Tips for Moving Your Office in Toronto" },
                        slug: { type: "string", example: "10-essential-tips-moving-office-toronto" },
                        content: { type: "string", description: "Full HTML content for the blog post" },
                        image: { type: "string", description: "Featured image URL" },
                        status: { type: "string", enum: ["draft", "published"], default: "published" },
                        category: { type: "string", example: "Movers" },
                        metaTitle: { type: "string" },
                        metaDescription: { type: "string" },
                        author: { type: "string", default: "Leadsharing Team" }
                    },
                    required: ["title", "slug", "content"]
                },
                Service: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        name: { type: "string", example: "Commercial Movers in Toronto" },
                        slug: { type: "string", example: "commercial-movers-in-toronto" },
                        description: { type: "string", description: "SEO description block JSON or string" },
                        content: { type: "string", description: "Rich HTML content guide" },
                        categoryId: { type: "integer" },
                        location: { type: "string", example: "Toronto" },
                        faq: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    question: { type: "string" },
                                    answer: { type: "string" }
                                }
                            }
                        },
                        isActive: { type: "boolean", default: true }
                    },
                    required: ["name", "slug"]
                },
                Category: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        name: { type: "string", example: "Movers" },
                        slug: { type: "string", example: "movers" },
                        subCategories: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "integer" },
                                    name: { type: "string" },
                                    slug: { type: "string" }
                                }
                            }
                        }
                    }
                }
            }
        },
        paths: {
            "/v1/seo": {
                get: {
                    summary: "Get SEO Settings",
                    description: "Fetch SEO metadata settings by pageName or list all configured SEO pages.",
                    operationId: "getSeoSettings",
                    parameters: [
                        {
                            name: "pageName",
                            in: "query",
                            description: "Specific page path or name (e.g., '/', '/local-tradespeople/toronto', 'global')",
                            required: false,
                            schema: { type: "string" }
                        }
                    ],
                    responses: {
                        "200": {
                            description: "SEO metadata settings",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "boolean" },
                                            data: {
                                                oneOf: [
                                                    { $ref: "#/components/schemas/SeoSetting" },
                                                    { type: "array", items: { $ref: "#/components/schemas/SeoSetting" } }
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                post: {
                    summary: "Create or Update SEO Settings",
                    description: "Upsert SEO metadata, canonical URL, OG tags, and structured schema markup for any page.",
                    operationId: "updateSeoSetting",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/SeoSetting" }
                            }
                        }
                    },
                    responses: {
                        "200": {
                            description: "SEO setting saved successfully",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "boolean" },
                                            message: { type: "string" },
                                            data: { $ref: "#/components/schemas/SeoSetting" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                delete: {
                    summary: "Delete SEO Setting",
                    description: "Delete an SEO metadata configuration by pageName or id.",
                    operationId: "deleteSeoSetting",
                    parameters: [
                        {
                            name: "pageName",
                            in: "query",
                            required: true,
                            schema: { type: "string" }
                        }
                    ],
                    responses: {
                        "200": {
                            description: "SEO setting deleted",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "boolean" },
                                            message: { type: "string" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/v1/blogs": {
                get: {
                    summary: "List Blog Articles",
                    description: "Fetch published or draft blog posts with optional search, category, or slug filtering.",
                    operationId: "getBlogs",
                    parameters: [
                        { name: "slug", in: "query", schema: { type: "string" } },
                        { name: "status", in: "query", schema: { type: "string", enum: ["published", "draft", "all"] } },
                        { name: "category", in: "query", schema: { type: "string" } },
                        { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
                        { name: "page", in: "query", schema: { type: "integer", default: 1 } }
                    ],
                    responses: {
                        "200": {
                            description: "List of blog posts",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "boolean" },
                                            data: { type: "array", items: { $ref: "#/components/schemas/Blog" } },
                                            total: { type: "integer" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                post: {
                    summary: "Create or Update Blog Article",
                    description: "Publish or update a rich blog article with HTML content, SEO metadata, and feature image.",
                    operationId: "createOrUpdateBlog",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Blog" }
                            }
                        }
                    },
                    responses: {
                        "200": {
                            description: "Blog article saved",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "boolean" },
                                            message: { type: "string" },
                                            data: { $ref: "#/components/schemas/Blog" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                delete: {
                    summary: "Delete Blog Article",
                    description: "Remove a blog post by slug or ID.",
                    operationId: "deleteBlog",
                    parameters: [
                        { name: "slug", in: "query", schema: { type: "string" } },
                        { name: "id", in: "query", schema: { type: "integer" } }
                    ],
                    responses: {
                        "200": {
                            description: "Blog deleted successfully"
                        }
                    }
                }
            },
            "/v1/services": {
                get: {
                    summary: "List Services",
                    description: "Query services across categories and cities.",
                    operationId: "getServices",
                    parameters: [
                        { name: "location", in: "query", schema: { type: "string" } },
                        { name: "category_id", in: "query", schema: { type: "integer" } },
                        { name: "search", in: "query", schema: { type: "string" } },
                        { name: "slug", in: "query", schema: { type: "string" } }
                    ],
                    responses: {
                        "200": {
                            description: "List of services",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "boolean" },
                                            data: { type: "array", items: { $ref: "#/components/schemas/Service" } }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                post: {
                    summary: "Create or Update Service",
                    description: "Add or update service details, HTML content guide, FAQs, and SEO descriptions.",
                    operationId: "createOrUpdateService",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Service" }
                            }
                        }
                    },
                    responses: {
                        "200": {
                            description: "Service saved"
                        }
                    }
                },
                delete: {
                    summary: "Delete Service",
                    description: "Remove a service by slug or ID.",
                    operationId: "deleteService",
                    parameters: [
                        { name: "slug", in: "query", schema: { type: "string" } },
                        { name: "id", in: "query", schema: { type: "integer" } }
                    ],
                    responses: {
                        "200": {
                            description: "Service deleted"
                        }
                    }
                }
            },
            "/v1/categories": {
                get: {
                    summary: "List Categories & Subcategories",
                    description: "Retrieve all service categories and their associated subcategories.",
                    operationId: "getCategories",
                    responses: {
                        "200": {
                            description: "Categories list",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "boolean" },
                                            data: { type: "array", items: { $ref: "#/components/schemas/Category" } }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                post: {
                    summary: "Create or Update Category",
                    description: "Add or modify a top-level category.",
                    operationId: "createOrUpdateCategory",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string", example: "Movers" },
                                        slug: { type: "string", example: "movers" }
                                    },
                                    required: ["name"]
                                }
                            }
                        }
                    },
                    responses: {
                        "200": { description: "Category saved" }
                    }
                }
            },
            "/v1/subcategories": {
                get: {
                    summary: "List Subcategories",
                    description: "List all subcategories mapped to parent categories.",
                    operationId: "getSubcategories",
                    parameters: [
                        { name: "category_id", in: "query", schema: { type: "integer" } }
                    ],
                    responses: {
                        "200": {
                            description: "Subcategories list"
                        }
                    }
                },
                post: {
                    summary: "Create or Update Subcategory",
                    description: "Add or update a subcategory under a parent category.",
                    operationId: "createOrUpdateSubcategory",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string", example: "Commercial Movers" },
                                        slug: { type: "string", example: "commercial-movers" },
                                        category_id: { type: "integer" }
                                    },
                                    required: ["name", "category_id"]
                                }
                            }
                        }
                    },
                    responses: {
                        "200": { description: "Subcategory saved" }
                    }
                }
            },
            "/v1/locations": {
                get: {
                    summary: "List Supported Locations",
                    description: "Fetch all 64+ cities and provinces supported across Canada.",
                    operationId: "getLocations",
                    responses: {
                        "200": {
                            description: "List of supported cities"
                        }
                    }
                }
            },
            "/v1/service-locations": {
                get: {
                    summary: "Get Service Location Pages",
                    description: "Query landing pages by city or trade.",
                    operationId: "getServiceLocations",
                    parameters: [
                        { name: "city", in: "query", schema: { type: "string" } },
                        { name: "service", in: "query", schema: { type: "string" } }
                    ],
                    responses: {
                        "200": {
                            description: "Service location data"
                        }
                    }
                },
                post: {
                    summary: "Create or Update Service Location Page",
                    description: "Update localized content, FAQs, and SEO metadata for a specific city-service page.",
                    operationId: "createOrUpdateServiceLocation",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        city: { type: "string", example: "Toronto" },
                                        serviceName: { type: "string", example: "Commercial Movers" },
                                        seoTitle: { type: "string" },
                                        metaDescription: { type: "string" },
                                        content: { type: "string" },
                                        faq: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    question: { type: "string" },
                                                    answer: { type: "string" }
                                                }
                                            }
                                        }
                                    },
                                    required: ["city", "serviceName"]
                                }
                            }
                        }
                    },
                    responses: {
                        "200": { description: "Service location saved successfully" }
                    }
                }
            }
        }
    };

    return NextResponse.json(openapiSpec, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
            "Cache-Control": "public, max-age=300"
        }
    });
}
