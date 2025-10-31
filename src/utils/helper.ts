import _ from 'lodash'
export const  isNullOrUndefined = (value:unknown): value is null | undefined => value == null


// This function is for creating a new object which only contain 
// attr that are defined initially
// The returned object should be a completely new object from source
// Do not mutate any value from source
export function assignValue(initState:any,source:any){
    if(isNullOrUndefined(source)) return null
    const result = JSON.parse(JSON.stringify(initState))
    Object.keys(initState).map(itemKey=>{
        const sourceValue = source[itemKey]
        if(isNullOrUndefined(sourceValue)) throw new Error("Attr missing when assigning values")

        if(sourceValue instanceof Date) {
            result[itemKey] = sourceValue.toISOString()
        }
        else if(sourceValue instanceof Function){
            throw new Error("Function should not be set to slice value")
        }
        else if(sourceValue instanceof Object){
            result[itemKey] = _.cloneDeep(sourceValue)
        }
        else {
            result[itemKey] = sourceValue
        } 
    })
    return result
}

