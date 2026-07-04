import { AbsAction } from '../AbsAction';
import { ActionTypeEnum } from '../../../contract/action';
import { ShapeData, ShapePropertyEnum } from '@/shapes/contract';
import { IocContainerService } from '@/common/contract';
import { IShapeManager } from '@/domain/contract';
import { BaseProperty } from '@/shapes/property/BaseProperty';
import { FillProperty } from '@/shapes/property/FillProperty';
import { StrokeProperty } from '@/shapes/property/StrokeProperty';

export class UpdatePropsAction extends AbsAction<ShapeData[]> {
	type: ActionTypeEnum.UpdateShapeProps = ActionTypeEnum.UpdateShapeProps;
	data: ShapeData[];

	constructor(data: ShapeData[], ioc: IocContainerService) {
		super(ioc);
		this.data = data;
	}

	genBackAction(): UpdatePropsAction {
		const shapeManager = this.ioc.get<IShapeManager>(IShapeManager);

		const shapeDatas: ShapeData[] = this.data.map((item) => {
			const shape = shapeManager.getShapeById(item.id);

			const properties: ShapeData['properties'] = {
				base:
					shape?.getProperty<BaseProperty>(ShapePropertyEnum.Base)?.value || item.properties.base,
			};

			if (item.properties.fill) {
				properties.fill = shape?.getProperty<FillProperty>(ShapePropertyEnum.Fill)?.value;
			}

			if (item.properties.stroke) {
				properties.stroke = shape?.getProperty<StrokeProperty>(ShapePropertyEnum.Stroke)?.value;
			}

			return {
				id: item.id,
				type: item.type,
				properties,
			};
		});

		return new UpdatePropsAction(shapeDatas, this.ioc);
	}
}
