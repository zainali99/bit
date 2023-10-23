# SIMPLE EXAMPLE for parsing POST data from bit.js requests



def example_view(request):
  import json
  image_data = json.loads(request.POST.get('image_data', '[]'))
  for item in image_data:
      image = request.FILES.get(item['key'])
      # other data is in item
      model.objects.create(
          file=image,
          author='Author'
      )
