let binding = Table.getBinding("rows");
if (!binding) return;

oPageHeaderNumber.setNumber("(" + binding.getLength() + ")");