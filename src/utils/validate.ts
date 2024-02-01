const isNumber = (val: any) => !Number.isNaN(Number(val));
const isObject = (val: any) => typeof val === 'object' && !Array.isArray(val);
const isNulOrArray = (val: any) => !val || Array.isArray(val);
const isNulOrObject = (val: any) => !val || isObject(val);

const rootProps = new Set(['inputs', 'presets', 'planStageBlacklist']);
const presetItemProps = new Set(['name', 'setting']);
const presetItemSettingProps = new Set(['evolve', 'skills', 'uniequip']);
const modReg = /^mod_(unlock|update)_token(_\d)?$/;
const stageReg = /^[0-9A-Z-]{1,10}$/;

export const validateMaterialData = (obj: any) => {
  if (typeof obj !== 'object') return false;
  if (Object.keys(obj).some(k => !rootProps.has(k))) return false;
  if (obj.inputs) {
    if (!isObject(obj.inputs)) return false;
    if (
      !Object.entries(obj.inputs).every(
        ([k, v]) => ((isNumber(k) && k.length <= 5) || modReg.test(k)) && Array.isArray(v) && v.length === 2 && v.every(isNumber),
      )
    ) {
      return false;
    }
  }
  if (obj.presets) {
    if (!Array.isArray(obj.presets)) return false;
    if (
      !(obj.presets as any[]).every(
        item =>
          isObject(item) &&
          Object.keys(item).every(k => presetItemProps.has(k)) &&
          typeof item.name === 'string' &&
          isObject(item.setting) &&
          Object.keys(item.setting).every(k => presetItemSettingProps.has(k)) &&
          isNulOrArray(item.setting.evolve) &&
          isNulOrObject(item.setting.skills) &&
          isNulOrObject(item.setting.uniequip),
      )
    ) {
      return false;
    }
  }
  if (obj.planStageBlacklist) {
    if (!Array.isArray(obj.planStageBlacklist)) return false;
    if (!(obj.planStageBlacklist as any[]).every(i => typeof i === 'string' && i.includes('-') && stageReg.test(i))) return false;
  }
  return true;
};
