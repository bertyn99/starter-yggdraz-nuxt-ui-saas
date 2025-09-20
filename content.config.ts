import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { asSchemaOrgCollection } from 'nuxt-schema-org/content'

const variantEnum = z.enum(['solid', 'outline', 'subtle', 'soft', 'ghost', 'link'])
const colorEnum = z.enum(['primary', 'secondary', 'neutral', 'error', 'warning', 'success', 'info'])
const sizeEnum = z.enum(['xs', 'sm', 'md', 'lg', 'xl'])
const orientationEnum = z.enum(['vertical', 'horizontal'])

const createBaseSchema = () => z.object({
  title: z.string().nonempty(),
  description: z.string().nonempty()
})

const createFeatureItemSchema = () => createBaseSchema().extend({
  icon: z.string().nonempty().editor({ input: 'icon' })
})

const createLinkSchema = () => z.object({
  label: z.string().nonempty(),
  to: z.string().nonempty(),
  icon: z.string().optional().editor({ input: 'icon' }),
  size: sizeEnum.optional(),
  trailing: z.boolean().optional(),
  target: z.string().optional(),
  color: colorEnum.optional(),
  variant: variantEnum.optional()
})

const createImageSchema = () => z.object({
  src: z.string().nonempty().editor({ input: 'media' }),
  alt: z.string().optional(),
  loading: z.string().optional(),
  srcset: z.string().optional()
})

export default defineContentConfig({
  collections: {
    index: defineCollection({
      source: '0.index.yml',
      type: 'page',
      schema: z.object({
        hero: z.object(({
          links: z.array(createLinkSchema())
        })),
        sections: z.array(
          createBaseSchema().extend({
            id: z.string().nonempty(),
            orientation: orientationEnum.optional(),
            reverse: z.boolean().optional(),
            features: z.array(createFeatureItemSchema())
          })
        ),
        features: createBaseSchema().extend({
          items: z.array(createFeatureItemSchema())
        }),
        testimonials: createBaseSchema().extend({
          headline: z.string().optional(),
          items: z.array(
            z.object({
              quote: z.string().nonempty(),
              user: z.object({
                name: z.string().nonempty(),
                description: z.string().nonempty(),
                to: z.string().nonempty(),
                target: z.string().nonempty(),
                avatar: createImageSchema()
              })
            })
          )
        }),
        cta: createBaseSchema().extend({
          links: z.array(createLinkSchema())
        })
      })
    }),
    docs: defineCollection({
      source: '1.docs/**/*',
      type: 'page'
    }),
    pricing: defineCollection({
      source: '2.pricing.yml',
      type: 'page',
      schema: z.object({
        plans: z.array(
          z.object({
            title: z.string().nonempty(),
            description: z.string().nonempty(),
            price: z.object({
              month: z.string().nonempty(),
              year: z.string().nonempty()
            }),
            billing_period: z.string().nonempty(),
            billing_cycle: z.string().nonempty(),
            button: createLinkSchema(),
            features: z.array(z.string().nonempty()),
            highlight: z.boolean().optional()
          })
        ),
        logos: z.object({
          title: z.string().nonempty(),
          icons: z.array(z.string())
        }),
        faq: createBaseSchema().extend({
          items: z.array(
            z.object({
              label: z.string().nonempty(),
              content: z.string().nonempty(),
              defaultOpen: z.boolean().optional()
            })
          )
        })
      })
    }),
    blog: defineCollection({
      source: '3.blog.yml',
      type: 'page'
    }),
    posts: defineCollection(
      asSchemaOrgCollection({
        source: '3.blog/**/*',
        type: 'page'
      }) as any),
    changelog: defineCollection({
      source: '4.changelog.yml',
      type: 'page'
    }),
    versions: defineCollection(asSchemaOrgCollection({
      source: '4.changelog/**/*',
      type: 'page'
    }) as any),
    faq: defineCollection({
      source: '5.faq.yml',
      type: 'page',
      schema: z.object({
        sections: z.array(
          z.object({
            title: z.string().nonempty(),
            description: z.string().nonempty(),
            items: z.array(
              z.object({
                question: z.string().nonempty(),
                answer: z.string().nonempty()
              })
            )
          })
        )
      })
    }),
    contact: defineCollection({
      source: '6.contact.yml',
      type: 'page',
      schema: z.object({
        hero: z.object({
          title: z.string().nonempty(),
          description: z.string().nonempty(),
          links: z.array(createLinkSchema())
        }),
        contact_info: z.object({
          title: z.string().nonempty(),
          description: z.string().nonempty(),
          methods: z.array(
            z.object({
              title: z.string().nonempty(),
              description: z.string().nonempty(),
              icon: z.string().nonempty(),
              contact: z.string().nonempty(),
              response_time: z.string().nonempty()
            })
          )
        }),
        office_locations: z.object({
          title: z.string().nonempty(),
          description: z.string().nonempty(),
          locations: z.array(
            z.object({
              city: z.string().nonempty(),
              country: z.string().nonempty(),
              address: z.string().nonempty(),
              phone: z.string().nonempty(),
              hours: z.string().nonempty()
            })
          )
        }),
        social_media: z.object({
          title: z.string().nonempty(),
          description: z.string().nonempty(),
          platforms: z.array(
            z.object({
              name: z.string().nonempty(),
              handle: z.string().nonempty(),
              url: z.string().nonempty(),
              icon: z.string().nonempty()
            })
          )
        }),
        faq_preview: z.object({
          title: z.string().nonempty(),
          description: z.string().nonempty(),
          link: createLinkSchema()
        })
      })
    }),
    privacy_policy: defineCollection({
      source: '7.privacy-policy.yml',
      type: 'page',
      schema: z.object({
        last_updated: z.string().nonempty(),
        effective_date: z.string().nonempty(),
        sections: z.array(
          z.object({
            title: z.string().nonempty(),
            content: z.string().nonempty()
          })
        )
      })
    }),
    terms_of_service: defineCollection({
      source: '8.terms-of-service.yml',
      type: 'page',
      schema: z.object({
        last_updated: z.string().nonempty(),
        effective_date: z.string().nonempty(),
        sections: z.array(
          z.object({
            title: z.string().nonempty(),
            content: z.string().nonempty()
          })
        )
      })
    })
  }
})
