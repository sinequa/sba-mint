## Metadata

The `Metadata` component offers several options for displaying dynamic information in your Angular applications. 

### API
| input | type | description | default |
|---|---|---|---|
| article* | Article | the record to extract metadata |
| metadata* | string | the metadata to extract |
| override | boolean | when true, you needs [to override the for loop](#overriding-the-for-loop) | false |
| className | css classes to apply to each element |

\* means "required"


### Examples
Here are some concrete examples of its use:

#### **Basic Method**

```html
<app-metadata [article]="article" metadata="company" />
```

In this example, `article` is an object of type `Article` from a search. The `Metadata` component will display the company metadata associated with this article.

#### **Overriding the Default Rendering**

* using the `className` attribute, you can customize the css of each metadata.  
* by default, each metadata is surrounded by a `<span>` HTML element.

```html
<app-metadata [article]="article" metadata="company" className="bg-slate-200">
```

#### **Overriding the for loop**

He you can completly override the rendering of each metadata.
* you need to set a reference to the Metadata component using the Angular reference syntax: `#<name>`
* you need to set the `override` attribute to `true`. With Angular 18 we will can remove this attribute because default
injection content can be done easily

```html
<app-metadata #ref [article]="article" metadata="company" [override]="true">
  @for(item of ref.items(); track $index) {
    <span>{{ item.display }}</span>
  }
</app-metadata>
```

Here, we override the default rendering of the `Metadata` component.

* `ref` is a reference to the `Metadata` component.
* `items()` is a signal that contains the elements of the "company" metadata.
* Each element of `items` is a JSON object of type `{ display: string, value: string }`.
* `value` can be used to apply filters.

#### **Adding Content Before or After the Default Rendering**

```html
<app-metadata [article]="article()" metadata="company">
  <span before>before rendering</span>
  <span after>after rendering</span>
</app-metadata>
```

This example shows how to add content before or after the default rendering of the `Metadata` component.

* The `before` and `after` directives allow you to insert content at specific locations.
* You can use `before` or `after` individually if you want.
* You can even set `before` before `after`, this has no effect.

### **Additional Information**

* The `Metadata` component is a generic component that can be used with different types of record's metadata.
* You can customize the rendering of metadata using Angular templates and directives.


