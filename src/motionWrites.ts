const previousStyles=new WeakMap<CSSStyleDeclaration,Map<string,{input:string;serialized:string}>>();

// CSS normalizes transform syntax, so remember both the input and the browser's
// serialized value. The live read also catches React updates and route cleanup.
export function writeMotionStyle(style:CSSStyleDeclaration,name:string,value:string) {
  let previous=previousStyles.get(style);
  const entry=previous?.get(name);
  if(entry?.input===value&&style.getPropertyValue(name)===entry.serialized)return;
  style.setProperty(name,value);
  if(!previous){previous=new Map();previousStyles.set(style,previous);}
  previous.set(name,{input:value,serialized:style.getPropertyValue(name)});
}

export function writeMotionAttribute(element:Element,name:string,value:string) {
  if(element.getAttribute(name)!==value)element.setAttribute(name,value);
}

export function writeMotionData(element:HTMLElement,name:string,value:string) {
  if(element.dataset[name]!==value)element.dataset[name]=value;
}

export function writeMotionInert(element:HTMLElement,value:boolean) {
  if(element.inert!==value)element.inert=value;
}
